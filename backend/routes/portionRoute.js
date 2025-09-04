const express = require('express');
const router = express.Router();
const portionController = require('../controllers/portionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hasPermission } = require('../controllers/permissionController');

// Belirli bir ürünün porsiyonlarını getir
router.get('/product/:productId',
  authenticateToken,
  hasPermission('products', 'read'),
  portionController.getProductPortions
);

// Yeni porsiyon oluştur
router.post('/',
  authenticateToken,
  hasPermission('products', 'update'),
  portionController.createPortion
);

// Porsiyon güncelle
router.put('/:id',
  authenticateToken,
  hasPermission('products', 'update'),
  portionController.updatePortion
);

// Porsiyon sil
router.delete('/:id',
  authenticateToken,
  hasPermission('products', 'update'),
  portionController.deletePortion
);

module.exports = router;


