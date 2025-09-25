const { Table, Section, Branch } = require('../models');

// Tüm masaları getir (opsiyonel branch_id ve section_id filtresi ile)
exports.getTables = async (req, res) => {
  try {
    const { branch_id, section_id } = req.query;
    const where = {
      business_id: req.user.business_id
    };
    
    if (branch_id) {
      where.branch_id = branch_id;
    }
    
    if (section_id) {
      where.section_id = section_id;
    }

    const tables = await Table.findAll({
      where,
      include: [
        {
          model: Branch,
          as: 'Branch',
          where: {
            business_id: req.user.business_id
          }
        },
        {
          model: Section,
          as: 'Section',
          where: {
            business_id: req.user.business_id
          }
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json(tables);
  } catch (error) {
    console.error('❌ Masaları getirme hatası:', error);
    res.status(500).json({ error: 'Masalar getirilemedi' });
  }
};

// Belirli bir masayı ID'ye göre getir
exports.getTableById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const table = await Table.findOne({
      where: {
        id: id,
        business_id: req.user.business_id
      },
      include: [
        {
          model: Branch,
          as: 'Branch',
          where: {
            business_id: req.user.business_id
          }
        },
        {
          model: Section,
          as: 'Section',
          where: {
            business_id: req.user.business_id
          }
        }
      ]
    });
    
    if (!table) {
      return res.status(404).json({ error: 'Masa bulunamadı' });
    }
    
    res.json(table);
  } catch (error) {
    console.error('❌ Masa getirme hatası:', error);
    res.status(500).json({ error: 'Masa getirilemedi' });
  }
};

// Yeni masa oluştur
exports.createTable = async (req, res) => {
  const { Table, Branch, Section, sequelize } = require('../models');
  
  // ✅ Transaction kullanarak eşzamanlı istekleri güvenli hale getir
  const transaction = await sequelize.transaction();
  
  try {
    const { branch_id, section_id, table_no } = req.body;
    
    if (!branch_id) {
      return res.status(400).json({ error: 'Şube ID zorunludur' });
    }
    
    // Şubenin varlığını kontrol et
    const branch = await Branch.findOne({
      where: {
        id: branch_id,
        business_id: req.user.business_id
      }
    });
    if (!branch) {
      return res.status(404).json({ error: 'Belirtilen şube bulunamadı' });
    }
    
    // Eğer section_id belirtilmişse, bölümün varlığını kontrol et
    if (section_id) {
      const section = await Section.findOne({
        where: {
          id: section_id,
          business_id: req.user.business_id
        }
      });
      if (!section) {
        return res.status(404).json({ error: 'Belirtilen bölüm bulunamadı' });
      }
      
      // Bölümün belirtilen şubeye ait olup olmadığını kontrol et
      if (section.branch_id !== parseInt(branch_id)) {
        return res.status(400).json({ error: 'Belirtilen bölüm bu şubeye ait değil' });
      }
    }
    
    // Eğer masa numarası belirtilmemişse, otomatik olarak belirle
    let finalTableNo = table_no;
    
    if (!finalTableNo) {
      // ✅ DÜZELTME: Transaction içinde şube bazında en yüksek masa numarasını bul
      const maxTable = await Table.findOne({
        where: {
          branch_id: branch_id, // Sadece şubeyi kontrol et, bölüm önemsiz
          business_id: req.user.business_id
        },
        order: [['table_no', 'DESC']],
        transaction, // Transaction içinde çalıştır
        lock: transaction.LOCK.UPDATE // Güvenlik için kilit kullan
      });
      
      // Yeni masa numarası belirle (şube içinde en yüksek numara + 1 veya 1)
      finalTableNo = maxTable ? maxTable.table_no + 1 : 1;
      
      console.log(`🟢 Şube ${branch_id} için yeni masa numarası: ${finalTableNo}`);
    }
    
    // ✅ Aynı şubede aynı masa numarası var mı kontrol et (transaction içinde)
    const existingTable = await Table.findOne({
      where: {
        branch_id: branch_id,
        table_no: finalTableNo,
        business_id: req.user.business_id
      },
      transaction
    });
    
    if (existingTable) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: `Bu şubede ${finalTableNo} numaralı masa zaten mevcut. Lütfen farklı bir numara seçin.` 
      });
    }
    
    const newTable = await Table.create({
      table_no: finalTableNo,
      branch_id,
      section_id: section_id || null,
      business_id: req.user.business_id
    }, { transaction });
    
    // Transaction'ı commit et
    await transaction.commit();
    
    // Oluşturulan masayı ilişkilerle birlikte getir
    const createdTable = await Table.findByPk(newTable.id, {
      include: [
        {
          model: Branch,
          as: 'Branch'
        },
        {
          model: Section,
          as: 'Section'
        }
      ]
    });
    
    res.status(201).json(createdTable);
  } catch (error) {
    // Hata durumunda transaction'ı geri al
    await transaction.rollback();
    console.error('❌ Masa oluşturma hatası:', error);
    res.status(500).json({ error: 'Masa oluşturulamadı' });
  }
};

  // Masa güncelle
exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { table_no, branch_id, section_id } = req.body;
    
    const table = await Table.findByPk(id);
    
    if (!table) {
      return res.status(404).json({ error: 'Masa bulunamadı' });
    }
    
    // Güncelleme verilerini hazırla
    const updateData = {};
    if (table_no) {
      // ✅ Aynı şubede aynı masa numarası var mı kontrol et (kendisi hariç)
      const existingTable = await Table.findOne({
        where: {
          branch_id: table.branch_id,
          table_no: table_no,
          id: { [require('sequelize').Op.ne]: id } // Kendisi hariç
        }
      });
      
      if (existingTable) {
        return res.status(400).json({ 
          error: `Bu şubede ${table_no} numaralı masa zaten mevcut. Lütfen farklı bir numara seçin.` 
        });
      }
      
      updateData.table_no = table_no;
    }
    
    if (branch_id) {
      // Şubenin varlığını kontrol et
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return res.status(404).json({ error: 'Belirtilen şube bulunamadı' });
      }
      updateData.branch_id = branch_id;
    }
    
    // section_id null olarak gönderilmişse, bölüm bağlantısını kaldır
    if (section_id === null) {
      updateData.section_id = null;
    } 
    // section_id belirtilmişse, bölümün varlığını ve şubeye aitliğini kontrol et
    else if (section_id) {
      const section = await Section.findByPk(section_id);
      if (!section) {
        return res.status(404).json({ error: 'Belirtilen bölüm bulunamadı' });
      }
      
      const targetBranchId = updateData.branch_id || table.branch_id;
      if (section.branch_id !== parseInt(targetBranchId)) {
        return res.status(400).json({ error: 'Belirtilen bölüm bu şubeye ait değil' });
      }
      
      updateData.section_id = section_id;
    }
    
    await table.update(updateData);
    
    // Güncellenmiş masayı getir
    const updatedTable = await Table.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'Branch'
        },
        {
          model: Section,
          as: 'Section'
        }
      ]
    });
    
    res.json(updatedTable);
  } catch (error) {
    console.error('❌ Masa güncelleme hatası:', error);
    res.status(500).json({ error: 'Masa güncellenemedi' });
  }
};

// Masa sil
exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    
    const table = await Table.findByPk(id);
    
    if (!table) {
      return res.status(404).json({ error: 'Masa bulunamadı' });
    }
    
    await table.destroy();
    
    res.json({ message: 'Masa başarıyla silindi' });
  } catch (error) {
    console.error('❌ Masa silme hatası:', error);
    res.status(500).json({ error: 'Masa silinemedi' });
  }
};
