const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if(file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      return cb(null, 'public/xlsx/'); // Excel dosyalarının kaydedileceği dizin
    }
    else if(file.mimetype.startsWith('image/')){
      cb(null, 'public/images/'); // Resimlerin kaydedileceği dizin
    }else{
      cb(new Error('Unsupported file type'), false);
    }
  },
  filename: (req,file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname)); // Dosya adı oluşturma
  }
});


// Multer middleware
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


router.post('/uploadExcel',upload.single('excel'),adminController.uploadExcel);

router.put('/products/updateShowcase/:productId', adminController.updateShowcase);

router.put('/products/updateStatus/:productId', adminController.updateStatus);

router.post('/products/updateImageUrl',upload.single('resim'), adminController.updateImageUrl);

router.put('/products/updatePrice',adminController.updateProductPrices);

router.put('/products/bulk-update-prices',adminController.bulkCreatePrices);


router.put('/products/yeniSira',adminController.updateProductsBySiraId);

router.post('/products/create',upload.single('resim'),adminController.createProduct);

router.get('/products/:id', adminController.getProductById);



router.put('/products/update',adminController.updateProduct);

router.get('/productsByCategory/:category_id', adminController.getProductsByCategory);

router.get('/productsBySiraid', adminController.getAllProductsOrderBySiraId);

router.get('/products', adminController.getAllProuducts);




router.post('/categories/create-sub', adminController.createSubCategory);
router.post('/categories/create', upload.single('resim'),adminController.createCategory);

router.get('/categories/subs/:id', adminController.getSubCategoriesByParentId);
router.get('/categories/last',adminController.getLastCategory);
router.get('/categories/:id', adminController.getCategoryById);

router.get('/categories', adminController.getCategories);

router.delete('/categories/:id', adminController.deleteCategory);

router.get('/menus/getRegisteredProducts/:id',adminController.getRegisteredProducts);
router.post('/menus/saveProducts', adminController.save_Products_To_Selected_Menu);
router.post('/menus/create', adminController.createMenu);
router.get('/menus/:id', adminController.getMenuById);
router.get('/menus', adminController.getMenus);

module.exports = router;


