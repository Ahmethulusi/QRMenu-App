const express = require('express');
const router = express.Router();
const recommendedProductController = require('../controllers/recommendedProductController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hasPermission } = require('../controllers/permissionController');

// Belirli bir ürünün yanında iyi gider ürünlerini getir
router.get('/product/:productId',
  authenticateToken,
  hasPermission('products', 'read'),
  recommendedProductController.getRecommendedProducts
);

// Kategori bazlı ürünleri getir (yanında iyi gider seçimi için)
router.get('/category/:categoryId',
  authenticateToken,
  hasPermission('products', 'read'),
  recommendedProductController.getProductsByCategory
);

// Yeni yanında iyi gider ürün ekle
router.post('/',
  authenticateToken,
  hasPermission('products', 'update'),
  recommendedProductController.addRecommendedProduct
);

// Bir ürünün tüm yanında iyi gider ürünlerini toplu güncelle
router.post('/bulk/:productId',
  authenticateToken,
  hasPermission('products', 'update'),
  recommendedProductController.bulkUpdateRecommendedProducts
);

// Yanında iyi gider ürün ilişkisini sil
router.delete('/:id',
  authenticateToken,
  hasPermission('products', 'update'),
  recommendedProductController.removeRecommendedProduct
);

module.exports = router;
