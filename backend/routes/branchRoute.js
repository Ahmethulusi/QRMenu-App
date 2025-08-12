const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hasPermission } = require('../controllers/permissionController');

// Şube görüntüleme işlemleri
router.get('/:businessId', 
  authenticateToken, 
  hasPermission('branches', 'read'), 
  branchController.getAllBranchesByBusinessId
);
router.get('/:businessId/details', 
  authenticateToken, 
  hasPermission('branches', 'read'), 
  branchController.getBusinessDetailsWithProducts
);
router.get("/:branchId/products", 
  authenticateToken, 
  hasPermission('branches', 'read'), 
  branchController.getProductsByBranchId
);
router.get('/matrix/:businessId', 
  authenticateToken, 
  hasPermission('branches', 'read'), 
  branchController.getBranchProductMatrix
);
router.get('/:branchId/:businessId/available-products', 
  authenticateToken, 
  hasPermission('branches', 'read'), 
  branchController.getAvailableProductsForBranch
);
router.get('/independentBuisnessBranch/:branchId', 
  authenticateToken, 
  hasPermission('branches', 'read'), 
  branchController.getBranchById
);

// Şube ürün yönetimi
router.post('/add-product-to-branch', 
  authenticateToken, 
  hasPermission('branches', 'update'), 
  branchController.AddProductToBranch
);
router.post('/branch-products', 
  authenticateToken, 
  hasPermission('branches', 'update'), 
  branchController.createBranchProduct
);
router.put('/branch-products', 
  authenticateToken, 
  hasPermission('branches', 'update'), 
  branchController.updateBranchProduct
);
router.delete('/branch-products', 
  authenticateToken, 
  hasPermission('branches', 'update'), 
  branchController.deleteBranchProduct
);

// Şube CRUD işlemleri
router.post('/', 
  authenticateToken, 
  hasPermission('branches', 'create'), 
  branchController.createBranch
);
router.put('/:branchId', 
  authenticateToken, 
  hasPermission('branches', 'update'), 
  branchController.updateBranch
);
router.delete('/:id', 
  authenticateToken, 
  hasPermission('branches', 'delete'), 
  branchController.deleteBranch
);

module.exports = router;
