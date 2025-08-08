const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllerBackup');
const { authenticateToken, checkPermission } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer setup (mevcut kod)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if(file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      return cb(null, 'public/xlsx/');
    }
    else if(file.mimetype.startsWith('image/')){
      cb(null, 'public/images/');
    }else{
      cb(new Error('Unsupported file type'), false);
    }
  },
  filename: (req,file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter:(req,file,cb)=>{
    if(
      file.mimetype.startsWith('image/') ||
      file.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype == 'application/vnd.ms-excel' 
    ){
      cb(null,true);
    }else{
      cb(new Error("Unsupported file type"),false);
    }
  }
});

// Excel upload
router.post('/uploadExcel', upload.single('excel'), adminController.uploadExcel);

// Ürün işlemleri
router.put('/products/updateShowcase/:productId', adminController.updateShowcase);
router.put('/products/updateStatus/:productId', adminController.updateStatus);
router.post('/products/updateImageUrl', upload.single('resim'), adminController.updateImageUrl);
router.put('/products/updatePrice', adminController.updateProductPrices);
router.put('/products/bulk-update-prices', adminController.bulkCreatePrices);
router.put('/products/yeniSira', adminController.updateProductsBySiraId);

// Ürün CRUD işlemleri
router.post('/products/create', upload.single('resim'), adminController.createProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.put('/products/update', adminController.updateProduct);
router.put('/products/updateImage', upload.single('resim'), adminController.updateProductImage);

// Ürün görüntüleme işlemleri - YETKİ KONTROLÜ EKLE
router.get('/productsByBusiness/:business_id', 
  authenticateToken, 
  checkPermission('products', 'read'), 
  adminController.getProductsByBusiness
);

router.get('/products/:id', 
  authenticateToken, 
  checkPermission('products', 'read'), 
  adminController.getProductById
);

router.get('/productsByCategory/:category_id', 
  authenticateToken, 
  checkPermission('products', 'read'), 
  adminController.getProductsByCategory
);

router.get('/productsBySiraid', 
  authenticateToken, 
  checkPermission('products', 'read'), 
  adminController.getAllProductsOrderBySiraId
);

router.get('/products', 
  authenticateToken, 
  checkPermission('products', 'read'), 
  adminController.getAllProuducts
);

// Kategori işlemleri
router.post('/categories/create-sub', adminController.createSubCategory);
router.post('/categories/create', upload.single('resim'), adminController.createCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.put('/categories/update/:category_id', upload.single('resim'), adminController.updateCategory);

// Kategori görüntüleme işlemleri - ZATEN VAR
router.get('/categories', 
  authenticateToken, 
  checkPermission('categories', 'read'), 
  adminController.getCategories
);

router.get('/categories/subs/:id', adminController.getSubCategoriesByParentId);
router.get('/categories/last', adminController.getLastCategory);
router.get('/categories/:id', adminController.getCategoryById);

// Kategori sıralama endpoint'i
router.put('/categories/updateSira', adminController.updateCategoriesSira);

module.exports = router;