const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBranchId, validateCategoryId, validateLanguageCode } = require('../middleware/validation');
const menuController = require('../controllers/menuController');

/**
 * Şube menüsünü getir
 * GET /api/menu/:branchId
 * Query parameters:
 * - lang: Dil kodu (tr, en, de, fr, es, ar) - default: 'tr'
 * - category: Kategori ID'si (opsiyonel)
 */
router.get('/:branchId', 
  validateBranchId, 
  validateLanguageCode, 
  asyncHandler(menuController.getBranchMenu)
);

/**
 * Sadece kategorileri getir
 * GET /api/menu/:branchId/categories
 */
router.get('/:branchId/categories', 
  validateBranchId, 
  validateLanguageCode, 
  asyncHandler(menuController.getBranchCategories)
);

/**
 * Belirli bir kategorideki ürünleri getir
 * GET /api/menu/:branchId/category/:categoryId
 */
router.get('/:branchId/category/:categoryId', 
  validateBranchId, 
  validateCategoryId, 
  validateLanguageCode, 
  asyncHandler(menuController.getCategoryProducts)
);

module.exports = router;