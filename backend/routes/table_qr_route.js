const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/table_qr_mngController.js');
const qrCodeGenerator = require('../controllers/qrcode_generator.js');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hasPermission } = require('../controllers/permissionController');
const { uploadSingle } = require('../middleware/uploadMiddleware');

// QR kod oluşturma
router.post('/', 
  authenticateToken, 
  hasPermission('qrcodes', 'create'), 
  uploadSingle('logo', 'logo'), 
  qrCodeGenerator.createQRCode
);

// QR kod oluşturma (create endpoint)
router.post('/create', 
  authenticateToken, 
  hasPermission('qrcodes', 'create'), 
  uploadSingle('logo', 'logo'), 
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
