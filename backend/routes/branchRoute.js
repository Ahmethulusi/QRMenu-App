const express = require('express');
const router = express.Router();
const branchController= require('../controllers/branchController');


router.get('/:businessId', branchController.getAllBranchesByBusinessId);
router.get('/:businessId/details', branchController.getBusinessDetailsWithProducts);
router.get("/:branchId/products",branchController.getProductsByBranchId);
router.get('/matrix/:businessId', branchController.getBranchProductMatrix);
// Şubeye eklenebilecek ürünleri getir
router.get('/:branchId/:businessId/available-products', branchController.getAvailableProductsForBranch);
// Yeni şube oluştur (business_id gövdede gelir)
router.post('/add-product-to-branch',branchController.AddProductToBranch);
router.post('/branch-products', branchController.createBranchProduct);
router.post('/', branchController.createBranch);

// Şube ürünü güncelleme - ÖNCE tanımlanmalı
router.put('/branch-products', branchController.updateBranchProduct);
// Şube güncelle
router.put('/:branchId', branchController.updateBranch);

// Şube sil
router.delete('/branch-products', branchController.deleteBranchProduct);
router.delete('/:id', branchController.deleteBranch);

// Tek şube detayını getir
router.get('/independentBuisnessBranch/:branchId', branchController.getBranchById);

module.exports = router;
