const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const tableController = require('../controllers/tableController');
const orderableQRController = require('../controllers/orderableQRController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Bölümler (Sections) için rotalar
router.get('/sections', authenticateToken, sectionController.getSections);
router.get('/sections/:id', authenticateToken, sectionController.getSectionById);
router.post('/sections', authenticateToken, sectionController.createSection);
router.put('/sections/:id', authenticateToken, sectionController.updateSection);
router.delete('/sections/:id', authenticateToken, sectionController.deleteSection);

// Masalar (Tables) için rotalar
router.get('/tables', authenticateToken, tableController.getTables);
router.get('/tables/:id', authenticateToken, tableController.getTableById);
router.post('/tables', authenticateToken, tableController.createTable);
router.put('/tables/:id', authenticateToken, tableController.updateTable);
router.delete('/tables/:id', authenticateToken, tableController.deleteTable);

// Siparişli QR kodları için rotalar
router.get('/qrcodes', authenticateToken, orderableQRController.getOrderableQRCodes);
router.get('/qrcodes/:id', authenticateToken, orderableQRController.getOrderableQRCodeById);
router.post('/qrcodes', authenticateToken, orderableQRController.createOrderableQRCode);
router.put('/qrcodes/:id', authenticateToken, orderableQRController.updateOrderableQRCode);
router.delete('/qrcodes/:id', authenticateToken, orderableQRController.deleteOrderableQRCode);

module.exports = router;
