const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/table_qr_mngController.js');
const qrCodeGenerator = require('../controllers/qrcode_generator.js');
const multer = require('multer');

// Memory storage kullan, dosya kaydetme
const storage = multer.memoryStorage();

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

// Bir QR'ı aktif yap
router.put('/:id/activate', qrCodeGenerator.activateQRCode);

module.exports = router;
