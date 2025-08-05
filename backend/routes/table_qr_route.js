const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/table_qr_mngController.js');
const qrCodeGenerator = require('../controllers/qrcode_generator.js');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/logos'); // hedef klasör
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post('/', upload.single('logo'), qrCodeGenerator.createQRCode);

// Tüm QR'ları getir
router.get('/', qrCodeController.getAllQRCodes);

// ID'ye göre QR getir
router.get('/:id', qrCodeController.getQRCodeById);

// QR sil
router.delete('/:id', qrCodeController.deleteQRCode);

// Nonorderable QR'ları listele
router.get('/nonorderable-list/:businessId', qrCodeGenerator.getNonOrderableQRCodesByBusiness);

// Bir QR'ı aktif yap
router.put('/:id/activate', qrCodeGenerator.activateQRCode);

module.exports = router;
