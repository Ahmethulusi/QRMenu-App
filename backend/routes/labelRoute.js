const express = require('express');
const router = express.Router();
const labelController = require('../controllers/labelController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hasPermission } = require('../controllers/permissionController');

// Tüm etiketleri getir
router.get('/', 
  authenticateToken, 
  hasPermission('labels', 'read'),
  labelController.getAllLabels
);

// Yeni etiket oluştur
router.post('/', 
  authenticateToken,
  hasPermission('labels', 'create'),
  labelController.createLabel
);

// Etiket güncelle
router.put('/:id', 
  authenticateToken,
  hasPermission('labels', 'update'),
  labelController.updateLabel
);

// Etiket sil
router.delete('/:id', 
  authenticateToken,
  hasPermission('labels', 'delete'),
  labelController.deleteLabel
);

// Belirli bir ürünün etiketlerini getir
router.get('/product/:productId', 
  authenticateToken, 
  hasPermission('products', 'read'),
  labelController.getProductLabels
);

// Bir etiketi kullanan ürünleri getir
router.get('/:id/products', 
  authenticateToken, 
  hasPermission('products', 'read'),
  labelController.getLabelProducts
);

module.exports = router;
