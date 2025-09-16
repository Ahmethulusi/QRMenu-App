const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { QRCode: QRCodeModel, Table, Section, Branch, Business } = require('../models');

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
      qr_url,
      color,
      size,
      logo_size_percent
    } = req.body;
    
    if (!business_id || !branch_id || !table_id || !qr_url) {
      return res.status(400).json({ 
        error: 'İşletme ID, şube ID, masa ID ve QR URL zorunludur' 
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
      qr_url,
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
    
    // QR URL değiştiyse yeni QR kodu oluştur
    if (qr_url && qr_url !== qrCode.qr_url) {
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
