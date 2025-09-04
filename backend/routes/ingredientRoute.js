const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hasPermission } = require('../controllers/permissionController');

// Belirli bir ürünün malzemelerini getir
router.get('/product/:productId',
  authenticateToken,
  hasPermission('products', 'read'),
  ingredientController.getProductIngredients
);

// Yeni malzeme oluştur
router.post('/',
  authenticateToken,
  hasPermission('products', 'update'),
  ingredientController.createIngredient
);

// Malzeme güncelle
router.put('/:id',
  authenticateToken,
  hasPermission('products', 'update'),
  ingredientController.updateIngredient
);

// Malzeme sil
router.delete('/:id',
  authenticateToken,
  hasPermission('products', 'update'),
  ingredientController.deleteIngredient
);

// Belirli bir malzemeyi getir
router.get('/:id',
  authenticateToken,
  hasPermission('products', 'read'),
  ingredientController.getIngredient
);

// Tüm malzemeleri getir (admin için)
router.get('/',
  authenticateToken,
  hasPermission('products', 'read'),
  ingredientController.getAllIngredients
);

module.exports = router;
