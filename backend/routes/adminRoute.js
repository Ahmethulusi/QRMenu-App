const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hasPermission } = require('../controllers/permissionController');
const { uploadSingleToCloudflare, createCloudflareUploadMiddleware } = require('../middleware/uploadMiddleware');

// Excel upload
router.post('/uploadExcel', 
  authenticateToken, 
  hasPermission('system', 'settings'), 
  uploadSingleToCloudflare('excel', 'excel'), 
  adminController.uploadExcel
);

// Ürün işlemleri
router.put('/products/updateShowcase/:productId', 
  authenticateToken, 
  hasPermission('products', 'update'), 
  adminController.updateShowcase
);
router.put('/products/updateStatus/:productId', 
  authenticateToken, 
  hasPermission('products', 'update'), 
  adminController.updateStatus
);
router.post('/products/updateImageUrl', 
  authenticateToken, 
  hasPermission('products', 'image_upload'), 
  uploadSingleToCloudflare('product', 'resim'), 
  adminController.updateImageUrl
);
router.put('/products/updatePrice', 
  authenticateToken, 
  hasPermission('products', 'update'), 
  adminController.updateProductPrices
);
router.put('/products/bulk-update-prices', 
  authenticateToken, 
  hasPermission('products', 'bulk_update'), 
  adminController.bulkCreatePrices
);
router.put('/products/yeniSira', 
  authenticateToken, 
  hasPermission('products', 'update'), 
  adminController.updateProductsBySiraId
);

// Ürün CRUD işlemleri
router.post('/products/create', 
  authenticateToken, 
  hasPermission('products', 'create'), 
  uploadSingleToCloudflare('product', 'resim'), 
  adminController.createProduct
);
router.delete('/products/:id', 
  authenticateToken, 
  hasPermission('products', 'delete'), 
  adminController.deleteProduct
);
router.put('/products/update', 
  authenticateToken, 
  hasPermission('products', 'update'), 
  adminController.updateProduct
);
router.put('/products/updateImage', 
  authenticateToken, 
  hasPermission('products', 'image_upload'), 
  uploadSingleToCloudflare('product', 'resim'), 
  adminController.updateProductImage
);

// Ürün görüntüleme işlemleri - ÖNEMLİ: Spesifik route'lar önce olmalı!

// Belirli bir ürünün önerilen ürünlerini getir - :id route'undan ÖNCE olmalı
router.get('/products/:product_id/recommended-data', 
  authenticateToken, 
  hasPermission('products', 'read'), 
  adminController.getRecommendedProductsData
);

router.get('/productsByBusiness/:business_id', 
  authenticateToken, 
  hasPermission('products', 'read'), 
  adminController.getProductsByBusiness
);

router.get('/productsByCategory/:category_id', 
  authenticateToken, 
  hasPermission('products', 'read'), 
  adminController.getProductsByCategory
);

router.get('/productsBySiraid', 
  authenticateToken, 
  hasPermission('products', 'read'), 
  adminController.getAllProductsOrderBySiraId
);

router.get('/products', 
  authenticateToken, 
  hasPermission('products', 'read'), 
  adminController.getAllProuducts
);

// Bu route en sonda olmalı çünkü :id her şeyi yakalar
router.get('/products/:id', 
  authenticateToken, 
  hasPermission('products', 'read'), 
  adminController.getProductById
);

// Kategori işlemleri
router.post('/categories/create-sub', 
  authenticateToken, 
  hasPermission('categories', 'create'), 
  adminController.createSubCategory
);
router.post('/categories/create', 
  authenticateToken, 
  hasPermission('categories', 'create'), 
  uploadSingleToCloudflare('category', 'resim'), 
  adminController.createCategory
);
router.delete('/categories/:id', 
  authenticateToken, 
  hasPermission('categories', 'delete'), 
  adminController.deleteCategory
);
router.put('/categories/update/:category_id', 
  authenticateToken, 
  hasPermission('categories', 'update'), 
  uploadSingleToCloudflare('category', 'resim'), 
  adminController.updateCategory
);

// Kategori görüntüleme işlemleri
router.get('/categories', 
  authenticateToken, 
  hasPermission('categories', 'read'), 
  adminController.getCategories
);

// Kategori listesi - CategorySelector için
router.get('/categories/list', 
  authenticateToken, 
  hasPermission('categories', 'read'), 
  adminController.getCategoriesList
);

router.get('/categories/subs/:id', 
  authenticateToken, 
  hasPermission('categories', 'read'), 
  adminController.getSubCategoriesByParentId
);
router.get('/categories/last', 
  authenticateToken, 
  hasPermission('categories', 'read'), 
  adminController.getLastCategory
);
router.get('/categories/:id', 
  authenticateToken, 
  hasPermission('categories', 'read'), 
  adminController.getCategoryById
);

// Kategori sıralama endpoint'i
router.put('/categories/updateSira', 
  authenticateToken, 
  hasPermission('categories', 'update'), 
  adminController.updateCategoriesSira
);

module.exports = router;