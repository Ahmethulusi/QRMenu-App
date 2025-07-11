const express = require('express');
const router = express.Router();
const branchController= require('../controllers/branchController');


router.get('/:businessId', branchController.getAllBranchesByBusinessId);
router.get('/:businessId/details', branchController.getBusinessDetailsWithProducts);
router.get("/:branchId/products",branchController.getProductsByBranchId);

module.exports = router;
