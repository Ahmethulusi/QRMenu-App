const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBusinessId, validateBranchId } = require('../middleware/validation');
const businessController = require('../controllers/businessController');

// İşletme bilgilerini getir
router.get('/:businessId', 
  validateBusinessId, 
  asyncHandler(businessController.getBusinessInfo)
);

// Şube bilgilerini getir (business bilgileri dahil)
router.get('/branch/:branchId', 
  validateBranchId, 
  asyncHandler(businessController.getBranchInfo)
);

module.exports = router;
