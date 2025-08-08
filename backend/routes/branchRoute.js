const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

router.get('/:businessId', branchController.getAllBranchesByBusinessId);
router.get('/:businessId/details', branchController.getBusinessDetailsWithProducts);
router.get("/:branchId/products", branchController.getProductsByBranchId);
router.get('/matrix/:businessId', branchController.getBranchProductMatrix);
router.get('/:branchId/:businessId/available-products', branchController.getAvailableProductsForBranch);
router.post('/add-product-to-branch', branchController.AddProductToBranch);
router.post('/branch-products', branchController.createBranchProduct);
router.post('/', branchController.createBranch);
router.put('/branch-products', branchController.updateBranchProduct);
router.put('/:branchId', branchController.updateBranch);
router.delete('/branch-products', branchController.deleteBranchProduct);
router.delete('/:id', branchController.deleteBranch);
router.get('/independentBuisnessBranch/:branchId', branchController.getBranchById);

module.exports = router;
