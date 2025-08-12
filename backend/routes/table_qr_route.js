const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/table_qr_mngController.js');
const qrCodeGenerator = require('../controllers/qrcode_generator.js');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hasPermission } = require('../controllers/permissionController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/logos');
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

// QR kod oluşturma
router.post('/', 
  authenticateToken, 
  hasPermission('qrcodes', 'create'), 
  upload.single('logo'), 
  qrCodeGenerator.createQRCode
);

// QR kod görüntüleme
router.get('/', 
  authenticateToken, 
  hasPermission('qrcodes', 'read'), 
  qrCodeController.getAllQRCodes
);
router.get('/:id', 
  authenticateToken, 
  hasPermission('qrcodes', 'read'), 
  qrCodeController.getQRCodeById
);
router.get('/nonorderable-list/:businessId', 
  authenticateToken, 
  hasPermission('qrcodes', 'read'), 
  qrCodeGenerator.getNonOrderableQRCodesByBusiness
);

// QR kod yönetimi
router.put('/:id/activate', 
  authenticateToken, 
  hasPermission('qrcodes', 'update'), 
  qrCodeGenerator.activateQRCode
);
router.delete('/:id', 
  authenticateToken, 
  hasPermission('qrcodes', 'delete'), 
  qrCodeController.deleteQRCode
);

module.exports = router;
