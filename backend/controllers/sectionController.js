const { Section, Branch } = require('../models');

// Tüm bölümleri getir (opsiyonel branch_id filtresi ile)
exports.getSections = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const where = {};
    
    if (branch_id) {
      where.branch_id = branch_id;
    }

    const sections = await Section.findAll({
      where,
      include: [
        {
          model: Branch,
          as: 'Branch'
        }
      ],
      order: [['id', 'ASC']]
    });

    res.json(sections);
  } catch (error) {
    console.error('❌ Bölümleri getirme hatası:', error);
    res.status(500).json({ error: 'Bölümler getirilemedi' });
  }
};

// Belirli bir bölümü ID'ye göre getir
exports.getSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const section = await Section.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'Branch'
        }
      ]
    });
    
    if (!section) {
      return res.status(404).json({ error: 'Bölüm bulunamadı' });
    }
    
    res.json(section);
  } catch (error) {
    console.error('❌ Bölüm getirme hatası:', error);
    res.status(500).json({ error: 'Bölüm getirilemedi' });
  }
};

// Yeni bölüm oluştur
exports.createSection = async (req, res) => {
  try {
    const { section_name, branch_id } = req.body;
    
    if (!section_name || !branch_id) {
      return res.status(400).json({ error: 'Bölüm adı ve şube ID zorunludur' });
    }
    
    // Şubenin varlığını kontrol et
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      return res.status(404).json({ error: 'Belirtilen şube bulunamadı' });
    }
    
    const newSection = await Section.create({
      section_name,
      branch_id
    });
    
    res.status(201).json(newSection);
  } catch (error) {
    console.error('❌ Bölüm oluşturma hatası:', error);
    res.status(500).json({ error: 'Bölüm oluşturulamadı' });
  }
};

// Bölüm güncelle
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { section_name, branch_id } = req.body;
    
    const section = await Section.findByPk(id);
    
    if (!section) {
      return res.status(404).json({ error: 'Bölüm bulunamadı' });
    }
    
    // Güncelleme verilerini hazırla
    const updateData = {};
    if (section_name) updateData.section_name = section_name;
    if (branch_id) {
      // Şubenin varlığını kontrol et
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return res.status(404).json({ error: 'Belirtilen şube bulunamadı' });
      }
      updateData.branch_id = branch_id;
    }
    
    await section.update(updateData);
    
    // Güncellenmiş bölümü getir
    const updatedSection = await Section.findByPk(id, {
      include: [
        {
          model: Branch,
          as: 'Branch'
        }
      ]
    });
    
    res.json(updatedSection);
  } catch (error) {
    console.error('❌ Bölüm güncelleme hatası:', error);
    res.status(500).json({ error: 'Bölüm güncellenemedi' });
  }
};

// Bölüm sil
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    
    const section = await Section.findByPk(id);
    
    if (!section) {
      return res.status(404).json({ error: 'Bölüm bulunamadı' });
    }
    
    await section.destroy();
    
    res.json({ message: 'Bölüm başarıyla silindi' });
  } catch (error) {
    console.error('❌ Bölüm silme hatası:', error);
    res.status(500).json({ error: 'Bölüm silinemedi' });
  }
};
