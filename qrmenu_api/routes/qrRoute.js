const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { validateQRCode } = require('../middleware/validation');
const qrController = require('../controllers/qrController');

/**
 * QR kod doğrulama endpoint'i
 * GET /api/qr/:qrCode
 * 
 * QR kodunu okutarak hangi şube/masa bilgilerini döndürür
 */
router.get('/:qrCode', validateQRCode, asyncHandler(qrController.validateQRCode));

/**
 * QR kod bilgilerini detaylı getir
 * GET /api/qr/:qrCode/details
 * 
 * QR kod hakkında daha detaylı bilgiler (debug için)
 */
router.get('/:qrCode/details', validateQRCode, asyncHandler(qrController.getQRCodeDetails));

module.exports = router;