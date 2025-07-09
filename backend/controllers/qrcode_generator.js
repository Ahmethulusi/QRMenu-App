const QRCode = require('qrcode');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
// const QRCodeModel = require('../models/QRCode'); // kendi model dosyana göre değişebilir
const QRCodeModel  = require('../models/QRCode');


exports.createQRCode = async (req, res) => {
  try {
    const {
      business_id,
      table_id,
      type,
      qr_url,
      color,
      size,
      logo_size_percent,
    } = req.body;

    console.log('Gelen body:', req.body);
    console.log('Gelen dosya:', req.file);

    // ❗ Önemli: frontend'den gelen veriler string olabilir, parse edelim
    const parsedBusinessId = parseInt(business_id);
    const parsedSize = parseInt(size) || 256;
    const parsedLogoPercent = parseInt(logo_size_percent) || 20;

    if (!qr_url || typeof qr_url !== 'string' || qr_url.trim() === '') {
      return res.status(400).json({ error: 'Geçerli bir qr_url alanı gönderilmelidir.' });
    }

    let logoPath = null;
    if (req.file) {
      logoPath = req.file.path; // multer ile gelen dosya yolu
    }

    const fileName = `${uuidv4()}.png`;
    const outputPath = path.join(__dirname, '..', 'public', 'qrcodes', fileName);

    // 1. QR kodu buffer olarak oluştur
    const qrBuffer = await QRCode.toBuffer(qr_url, {
      color: {
        dark: color || '#000000',
        light: '#FFFFFF',
      },
      width: parsedSize,
    });

    let finalImage;

    if (logoPath) {
      try {
        const qrImage = await Jimp.read(qrBuffer);
        const logoImage = await Jimp.read(path.resolve(logoPath));
        const logoSize = Math.round(parsedSize * parsedLogoPercent / 100);
        logoImage.resize(logoSize, logoSize);
        const x = (qrImage.bitmap.width - logoSize) / 2;
        const y = (qrImage.bitmap.height - logoSize) / 2;
        finalImage = qrImage.composite(logoImage, x, y);
      } catch (err) {
        console.error('Logo eklenirken hata, logosuz devam ediliyor:', err);
        finalImage = await Jimp.read(qrBuffer);
      }
    } else {
      finalImage = await Jimp.read(qrBuffer);
    }

    // 2. Görseli kaydet
    await finalImage.writeAsync(outputPath);

    const file_path = `/qrcodes/${fileName}`;

    // 3. Veritabanına kayıt (isteğe bağlı alanlar varsa kontrol et)
    const result = await QRCodeModel.create({
      business_id: parsedBusinessId,
      table_id: table_id || null,
      type,
      qr_url,
      file_path,
      color,
      size: parsedSize,
    });

    res.status(201).json({ message: 'QR oluşturuldu', file_path });
  } catch (err) {
    console.error('QR oluşturma hatası:', err);
    res.status(500).json({ error: 'QR oluşturulamadı' });
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

    res.json(qrCodes); // sade bir array döndürüyoruz
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
