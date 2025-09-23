const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { QRCode: QRCodeModel, Table, Section, Branch, Business } = require('../models');

// QR hash oluşturma fonksiyonu
function generateQRHash(businessId, branchId, tableId) {
  const data = `${businessId}_${branchId || 'nobranch'}_${tableId || 'notable'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return crypto.createHash('md5').update(data).digest('hex').substring(0, 12);
}

// Siparişli QR kodlarını getir
exports.getOrderableQRCodes = async (req, res) => {
  try {
    const { business_id, branch_id, table_id } = req.query;
    
    const where = {
      type: 'orderable'
    };
    
    if (business_id) where.business_id = business_id;
    if (branch_id) where.branch_id = branch_id;
    if (table_id) where.table_id = table_id;

    const qrCodes = await QRCodeModel.findAll({
      where,
      include: [
        {
          model: Table,
          as: 'Table'
        },
        {
          model: Branch,
          as: 'Branch'
        }
      ],
      order: [['id', 'DESC']]
    });

    res.json(qrCodes);
  } catch (error) {
    console.error('❌ Siparişli QR kodlarını getirme hatası:', error);
    res.status(500).json({ error: 'Siparişli QR kodları getirilemedi' });
  }
};

// Belirli bir QR kodunu ID'ye göre getir
exports.getOrderableQRCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const qrCode = await QRCodeModel.findOne({
      where: {
        id,
        type: 'orderable'
      },
      include: [
        {
          model: Table,
          as: 'Table'
        },
        {
          model: Branch,
          as: 'Branch'
        }
      ]
    });
    
    if (!qrCode) {
      return res.status(404).json({ error: 'Siparişli QR kodu bulunamadı' });
    }
    
    res.json(qrCode);
  } catch (error) {
    console.error('❌ Siparişli QR kodu getirme hatası:', error);
    res.status(500).json({ error: 'Siparişli QR kodu getirilemedi' });
  }
};

// Yeni siparişli QR kodu oluştur
exports.createOrderableQRCode = async (req, res) => {
  try {
    const {
      business_id,
      branch_id,
      table_id,
      base_url, // Değişiklik: qr_url yerine base_url
      color,
      size,
      logo_size_percent
    } = req.body;
    
    if (!business_id || !branch_id || !table_id || !base_url) {
      return res.status(400).json({ 
        error: 'İşletme ID, şube ID, masa ID ve base URL zorunludur' 
      });
    }
    
    // İşletme ID kontrolü - sadece ID'nin geçerli bir sayı olup olmadığını kontrol et
    if (!Number.isInteger(parseInt(business_id))) {
      return res.status(400).json({ error: 'Geçersiz işletme ID' });
    }
    
    // Şubenin varlığını kontrol et
    const branch = await Branch.findByPk(branch_id);
    if (!branch) {
      return res.status(404).json({ error: 'Belirtilen şube bulunamadı' });
    }
    
    // Masanın varlığını ve şubeye aitliğini kontrol et
    const table = await Table.findByPk(table_id);
    if (!table) {
      return res.status(404).json({ error: 'Belirtilen masa bulunamadı' });
    }
    
    if (table.branch_id !== parseInt(branch_id)) {
      return res.status(400).json({ error: 'Belirtilen masa bu şubeye ait değil' });
    }
    
    // Aynı masa için zaten QR kodu var mı kontrol et
    const existingQR = await QRCodeModel.findOne({
      where: {
        table_id,
        type: 'orderable'
      }
    });
    
    if (existingQR) {
      return res.status(400).json({ 
        error: 'Bu masa için zaten bir siparişli QR kodu mevcut',
        existing_qr: existingQR
      });
    }
    
    const parsedSize = parseInt(size) || 256;
    const parsedLogoPercent = parseInt(logo_size_percent) || 20;
    
    // ✅ Hash oluştur ve QR URL'i yapılandır
    const qrHash = generateQRHash(business_id, branch_id, table_id);
    const qr_url = `${base_url.replace(/\/$/, '')}/scan/${qrHash}`;
    
    console.log('🟢 Siparişli QR Hash oluşturuldu:', qrHash);
    console.log('🟢 Siparişli QR URL:', qr_url);
    
    // QR kod dosyasını oluştur
    const fileName = `orderable_${uuidv4()}.png`;
    const outputPath = path.join(__dirname, '..', 'public', 'qrcodes', fileName);
    const publicPath = `/qrcodes/${fileName}`;
    
    // QR kodu oluştur
    await QRCode.toFile(outputPath, qr_url, {
      color: {
        dark: color || '#000000',
        light: '#FFFFFF'
      },
      width: parsedSize,
      errorCorrectionLevel: 'H'
    });
    
    // QR kodu veritabanına kaydet
    const newQRCode = await QRCodeModel.create({
      business_id,
      branch_id,
      table_id,
      type: 'orderable',
      qr_url,
      file_path: publicPath,
      color: color || '#000000',
      size: parsedSize,
      is_active: true
    });
    
    // Oluşturulan QR kodunu ilişkilerle birlikte getir
    const createdQRCode = await QRCodeModel.findByPk(newQRCode.id, {
      include: [
        {
          model: Table,
          as: 'Table'
        },
        {
          model: Branch,
          as: 'Branch'
        }
      ]
    });
    
    res.status(201).json(createdQRCode);
  } catch (error) {
    console.error('❌ Siparişli QR kodu oluşturma hatası:', error);
    res.status(500).json({ error: 'Siparişli QR kodu oluşturulamadı' });
  }
};

// QR kodunu güncelle
exports.updateOrderableQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      base_url, // Değişiklik: qr_url yerine base_url
      color,
      size,
      is_active
    } = req.body;
    
    const qrCode = await QRCodeModel.findOne({
      where: {
        id,
        type: 'orderable'
      }
    });
    
    if (!qrCode) {
      return res.status(404).json({ error: 'Siparişli QR kodu bulunamadı' });
    }
    
    // Güncelleme verilerini hazırla
    const updateData = {};
    
    // Base URL değiştiyse yeni QR kodu oluştur
    if (base_url) {
      // Yeni hash oluştur
      const qrHash = generateQRHash(qrCode.business_id, qrCode.branch_id, qrCode.table_id);
      const qr_url = `${base_url.replace(/\/$/, '')}/scan/${qrHash}`;
      
      console.log('🟢 Güncellenmiş QR Hash:', qrHash);
      console.log('🟢 Güncellenmiş QR URL:', qr_url);
      
      updateData.qr_url = qr_url;
      
      // Eski dosyayı sil
      if (qrCode.file_path) {
        const oldFilePath = path.join(__dirname, '..', 'public', qrCode.file_path.substring(1));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Yeni QR kodu oluştur
      const fileName = `orderable_${uuidv4()}.png`;
      const outputPath = path.join(__dirname, '..', 'public', 'qrcodes', fileName);
      const publicPath = `/qrcodes/${fileName}`;
      
      await QRCode.toFile(outputPath, qr_url, {
        color: {
          dark: color || qrCode.color || '#000000',
          light: '#FFFFFF'
        },
        width: size || qrCode.size || 256,
        errorCorrectionLevel: 'H'
      });
      
      updateData.file_path = publicPath;
    }
    
    // Diğer alanları güncelle
    if (color) updateData.color = color;
    if (size) updateData.size = parseInt(size);
    if (is_active !== undefined) updateData.is_active = is_active;
    
    await qrCode.update(updateData);
    
    // Güncellenmiş QR kodunu getir
    const updatedQRCode = await QRCodeModel.findByPk(id, {
      include: [
        {
          model: Table,
          as: 'Table'
        },
        {
          model: Branch,
          as: 'Branch'
        }
      ]
    });
    
    res.json(updatedQRCode);
  } catch (error) {
    console.error('❌ Siparişli QR kodu güncelleme hatası:', error);
    res.status(500).json({ error: 'Siparişli QR kodu güncellenemedi' });
  }
};

// QR kodunu sil
exports.deleteOrderableQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    
    const qrCode = await QRCodeModel.findOne({
      where: {
        id,
        type: 'orderable'
      }
    });
    
    if (!qrCode) {
      return res.status(404).json({ error: 'Siparişli QR kodu bulunamadı' });
    }
    
    // Dosyayı sil
    if (qrCode.file_path) {
      const filePath = path.join(__dirname, '..', 'public', qrCode.file_path.substring(1));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await qrCode.destroy();
    
    res.json({ message: 'Siparişli QR kodu başarıyla silindi' });
  } catch (error) {
    console.error('❌ Siparişli QR kodu silme hatası:', error);
    res.status(500).json({ error: 'Siparişli QR kodu silinemedi' });
  }
};
