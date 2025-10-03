const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBranchId, validateLanguageCode } = require('../middleware/validation');
const labelController = require('../controllers/labelController');

/**
 * Şubeye ait aktif etiketleri getir
 * GET /api/labels/:branchId
 * Query parameters:
 * - lang: Dil kodu (tr, en, de, fr, es, ar) - default: 'tr'
 * - business_id: İşletme ID'si (opsiyonel, şube üzerinden alınır)
 */
router.get('/:branchId', 
  validateBranchId, 
  validateLanguageCode, 
  asyncHandler(labelController.getBranchLabels)
);

/**
 * Belirli bir etikete ait ürünleri getir
 * GET /api/labels/:branchId/:labelId
 * Query parameters:
 * - lang: Dil kodu (tr, en, de, fr, es, ar) - default: 'tr'
 */
router.get('/:branchId/:labelId', 
  validateBranchId, 
  validateLanguageCode, 
  asyncHandler(labelController.getLabelProducts)
);

module.exports = router;
