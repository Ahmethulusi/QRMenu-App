const QRCode = require('qrcode');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
// const QRCodeModel = require('../models/QRCode'); // kendi model dosyana göre değişebilir
const QRCodeModel  = require('../models/QRCode');

const { Business } = require('../models'); // İşletme modelini içe aktar



exports.createQRCode = async (req, res) => {
  try {
    console.log('🟡 [createQRCode] İstek alındı:', req.body);

    const {
      business_id,
      branch_id,
      table_id,
      type,
      qr_url,
      color,
      size,
      logo_size_percent,
    } = req.body;

    if (!business_id || !qr_url || typeof qr_url !== 'string' || qr_url.trim() === '') {
      console.log('🔴 Gerekli alanlar eksik.');
      return res.status(400).json({ error: 'Geçerli bir qr_url ve business_id gönderilmelidir.' });
    }

    const parsedBusinessId = parseInt(business_id);
    const parsedBranchId = branch_id ? parseInt(branch_id) : null;
    const parsedTableId = table_id ? parseInt(table_id) : null;
    const parsedSize = parseInt(size) || 256;
    const parsedLogoPercent = parseInt(logo_size_percent) || 20;

    // ✅ Business kontrolü
    const business = await Business.findByPk(parsedBusinessId);
    if (!business) {
      console.log(`🔴 İşletme bulunamadı: ID ${parsedBusinessId}`);
      return res.status(400).json({ error: `ID'si ${parsedBusinessId} olan bir işletme bulunamadı.` });
    }

    const fileName = `${uuidv4()}.png`;
    const outputPath = path.join(__dirname, '..', 'public', 'qrcodes', fileName);

    const qrBuffer = await QRCode.toBuffer(qr_url, {
      color: {
        dark: color || '#000000',
        light: '#FFFFFF',
      },
      width: parsedSize,
    });

    let finalImage;
    if (req.file) {
      try {
        const qrImage = await Jimp.read(qrBuffer);
        const logoImage = await Jimp.read(path.resolve(req.file.path));
        const logoSize = Math.round(parsedSize * parsedLogoPercent / 100);
        logoImage.resize(logoSize, logoSize);
        const x = (qrImage.bitmap.width - logoSize) / 2;
        const y = (qrImage.bitmap.height - logoSize) / 2;
        finalImage = qrImage.composite(logoImage, x, y);
      } catch (logoErr) {
        console.error('🟠 Logo eklenemedi:', logoErr);
        finalImage = await Jimp.read(qrBuffer);
      }
    } else {
      finalImage = await Jimp.read(qrBuffer);
    }

    await finalImage.writeAsync(outputPath);
    const file_path = `/qrcodes/${fileName}`;

    const qrRecord = await QRCodeModel.create({
      business_id: parsedBusinessId,
      branch_id: parsedBranchId,
      table_id: parsedTableId,
      type,
      qr_url,
      file_path,
      color,
      size: parsedSize,
    });

    console.log('🟢 QR başarıyla oluşturuldu:', qrRecord.id);

    res.status(201).json({
      message: 'QR oluşturuldu',
      file_path,
      qr: qrRecord,
    });

  } catch (err) {
    console.error('🔴 QR oluşturma hatası:', err);
    res.status(500).json({ error: 'QR oluşturulamadı', details: err.message });
  }
};


// List all QRs for a business, optionally filter by branch or table
exports.getQRCodes = async (req, res) => {
  try {
    const { business_id, branch_id, table_id, type } = req.query;

    const where = {};
    if (business_id) where.business_id = business_id;
    if (branch_id) where.branch_id = branch_id;
    if (table_id) where.table_id = table_id;
    if (type) where.type = type;

    const qrCodes = await QRCodeModel.findAll({
      where,
      order: [['id', 'DESC']],
    });

    res.status(200).json(qrCodes);
  } catch (error) {
    console.error("QR kodları alınamadı:", error);
    res.status(500).json({ error: 'QR kodları alınamadı', details: error.message });
  }
};

// exports.getNonOrderableQRCodes = async (req, res) => {
//   try {
//     const { business_id } = req.query;
//     const where = { type: 'nonorderable' };
//     if (business_id) where.business_id = business_id;
//     const qrList = await QRCodeModel.findAll({ where, order: [['id', 'DESC']] });
//     res.json(qrList);
//   } catch (err) {
//     res.status(500).json({ error: 'QR kodları alınamadı' });
//   }
// };


// List all nonorderable QRs for a business (DEPRECATED, use getQRCodes with type)
exports.getNonOrderableQRCodesByBusiness = async (req, res) => {
  const { businessId } = req.params;
  try {
    const qrCodes = await QRCodeModel.findAll({
      where: {
        business_id: businessId,
        type: 'nonorderable',
      },
      order: [['id', 'DESC']],
    });
    res.json(qrCodes);
  } catch (error) {
    console.error("QR kodları alınamadı:", error);
    res.status(500).json({ error: 'QR kodları alınamadı' });
  }
};



exports.activateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.body;
    if (!business_id) return res.status(400).json({ error: 'business_id gerekli' });
    // Tüm nonorderable QR'ları pasif yap
    await QRCodeModel.update({ is_active: false }, { where: { type: 'nonorderable', business_id } });
    // Seçili QR'ı aktif yap
    await QRCodeModel.update({ is_active: true }, { where: { id } });
    res.json({ message: 'QR aktif edildi' });
  } catch (err) {
    res.status(500).json({ error: 'Aktiflik güncellenemedi' });
  }
};
