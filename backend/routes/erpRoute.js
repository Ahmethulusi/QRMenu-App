const express = require('express');
const router = express.Router();
const erpController = require('../controllers/erpController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Tüm ERP route'ları için authentication gerekli
router.use(authenticateToken);

// ERP bağlantı bilgilerini güncelle
router.put('/config', erpController.updateERPConfig);

// ERP bağlantısını test et
router.post('/test-connection', erpController.testConnection);

// Kategorileri senkronize et
router.post('/sync-categories', erpController.syncCategories);

// Ürünleri senkronize et
router.post('/sync-products', erpController.syncProducts);

// Tam senkronizasyon
router.post('/full-sync', erpController.fullSync);

// Stok durumlarını güncelle
router.post('/update-stock', erpController.updateStockLevels);

// ERP durum bilgilerini getir
router.get('/status', erpController.getERPStatus);

module.exports = router;
