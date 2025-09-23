const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { validateProductId, validateLanguageCode } = require('../middleware/validation');
const productController = require('../controllers/productController');

/**
 * Ürün detaylarını getir
 * GET /api/product/:productId
 * Query parameters:
 * - lang: Dil kodu (tr, en, de, fr, es, ar) - default: 'tr'
 */
router.get('/:productId', 
  validateProductId, 
  validateLanguageCode, 
  asyncHandler(productController.getProductDetails)
);

/**
 * Ürün alerjen bilgilerini getir
 * GET /api/product/:productId/allergens
 */
router.get('/:productId/allergens', 
  validateProductId, 
  asyncHandler(productController.getProductAllergens)
);

/**
 * Ürün beslenme bilgilerini getir
 * GET /api/product/:productId/nutrition
 */
router.get('/:productId/nutrition', 
  validateProductId, 
  asyncHandler(productController.getProductNutrition)
);

module.exports = router;