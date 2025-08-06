const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllerBackup');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
// const { authenticateToken } = require('../middleware/authMiddleware'); // Geçici olarak kaldırıldı

// Multer setup
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

// Excel upload - geçici olarak yetki kontrolü kaldırıldı
router.post('/uploadExcel', upload.single('excel'), adminController.uploadExcel);

// Ürün işlemleri - geçici olarak yetki kontrolü kaldırıldı
router.put('/products/updateShowcase/:productId', adminController.updateShowcase);
router.put('/products/updateStatus/:productId', adminController.updateStatus);
router.post('/products/updateImageUrl', upload.single('resim'), adminController.updateImageUrl);
router.put('/products/updatePrice', adminController.updateProductPrices);
router.put('/products/bulk-update-prices', adminController.bulkCreatePrices);
router.put('/products/yeniSira', adminController.updateProductsBySiraId);

// Ürün CRUD işlemleri - geçici olarak yetki kontrolü kaldırıldı
router.post('/products/create', upload.single('resim'), adminController.createProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.put('/products/update', adminController.updateProduct);
router.put('/products/updateImage', upload.single('resim'), adminController.updateProductImage);

// Ürün görüntüleme işlemleri - geçici olarak yetki kontrolü kaldırıldı
router.get('/productsByBusiness/:business_id', adminController.getProductsByBusiness);
router.get('/products/:id', adminController.getProductById);
router.get('/productsByCategory/:category_id', adminController.getProductsByCategory);
router.get('/productsBySiraid', adminController.getAllProductsOrderBySiraId);
router.get('/products', adminController.getAllProuducts);

// Kategori işlemleri - geçici olarak yetki kontrolü kaldırıldı
router.post('/categories/create-sub', adminController.createSubCategory);
router.post('/categories/create', upload.single('resim'), adminController.createCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Kategori görüntüleme işlemleri - geçici olarak yetki kontrolü kaldırıldı
router.get('/categories/subs/:id', adminController.getSubCategoriesByParentId);
router.get('/categories/last', adminController.getLastCategory);
router.get('/categories/:id', adminController.getCategoryById);
router.get('/categories', adminController.getCategories);

module.exports = router;