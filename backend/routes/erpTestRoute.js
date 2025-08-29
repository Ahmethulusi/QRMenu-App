const express = require('express');
const router = express.Router();
const erpTestController = require('../controllers/erpTestController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Tüm test route'ları için authentication gerekli
router.use(authenticateToken);

// Test konfigürasyonu al
router.get('/config', erpTestController.getTestConfig);

// Test konfigürasyonu güncelle
router.put('/config', erpTestController.updateTestConfig);

// Test bağlantısı
router.post('/test-connection', erpTestController.testConnection);

// Test sorguları (otomatik)
router.post('/test-queries', erpTestController.testQueries);

// Özel sorgu testi
router.post('/test-custom-query', erpTestController.testCustomQuery);

module.exports = router;
