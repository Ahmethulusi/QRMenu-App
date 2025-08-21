# 📸 Upload Middleware Kullanım Kılavuzu

Bu middleware, tüm dosya yükleme işlemlerini merkezi olarak yönetir ve tutarlı bir API sağlar.

## 🚀 Hızlı Başlangıç

### 1. Import Etme
```javascript
const { 
  uploadSingle, 
  uploadMultiple, 
  uploadFields, 
  uploadExcel 
} = require('../middleware/uploadMiddleware');
```

### 2. Basit Kullanım
```javascript
// Tek dosya yükleme
router.post('/upload', uploadSingle('product', 'resim'), controller.upload);

// Çoklu dosya yükleme
router.post('/upload', uploadMultiple('product', 'resimler', 5), controller.upload);

// Farklı alanlardan dosya yükleme
router.post('/upload', uploadFields('announcement', [
  { name: 'image', maxCount: 1 },
  { name: 'background_image', maxCount: 1 }
]), controller.upload);

// Excel dosyası yükleme
router.post('/upload', uploadExcel(), controller.upload);
```

## 📋 Desteklenen Upload Tipleri

| Tip | Hedef Klasör | Maksimum Boyut | Desteklenen Formatlar |
|-----|---------------|----------------|----------------------|
| `product` | `public/images` | 5MB | JPEG, JPG, PNG, WebP |
| `announcement` | `public/images` | 10MB | JPEG, JPG, PNG, WebP |
| `logo` | `public/logos` | 2MB | JPEG, JPG, PNG, SVG |
| `category` | `public/images` | 3MB | JPEG, JPG, PNG |
| `avatar` | `public/avatars` | 1MB | JPEG, JPG, PNG |
| `excel` | `public/xlsx` | 10MB | XLSX, XLS, CSV |

## 🔧 Özelleştirme

### Hata Mesajlarını Özelleştirme
```javascript
const { customizeErrorMessages } = require('../middleware/uploadMiddleware');

customizeErrorMessages('product', {
  errorMessage: 'Ürün resmi için özel hata mesajı!'
});
```

### Özel Konfigürasyon
```javascript
const { createUploadMiddleware } = require('../middleware/uploadMiddleware');

const customUpload = createUploadMiddleware('product', {
  maxSize: 10 * 1024 * 1024, // 10MB
  destination: 'public/custom_images'
});
```

## 📁 Route Örnekleri

### Ürün Resmi Yükleme
```javascript
// adminRoute.js
const { uploadSingle } = require('../middleware/uploadMiddleware');

router.post('/products/create', 
  authenticateToken, 
  hasPermission('products', 'create'), 
  uploadSingle('product', 'resim'), 
  adminController.createProduct
);
```

### Duyuru Resimleri Yükleme
```javascript
// announcementRoute.js
const { uploadFields } = require('../middleware/uploadMiddleware');

const announcementUpload = uploadFields('announcement', [
  { name: 'image', maxCount: 1 },
  { name: 'background_image', maxCount: 1 }
]);

router.post('/', authenticateToken, announcementUpload, announcementController.createAnnouncement);
```

### Logo Yükleme
```javascript
// table_qr_route.js
const { uploadSingle } = require('../middleware/uploadMiddleware');

router.post('/', 
  authenticateToken, 
  hasPermission('qrcodes', 'create'), 
  uploadSingle('logo', 'logo'), 
  qrCodeController.createQRCode
);
```

### Excel Dosyası Yükleme
```javascript
// adminRoute.js
const { uploadExcel } = require('../middleware/uploadMiddleware');

router.post('/uploadExcel', 
  authenticateToken, 
  hasPermission('system', 'settings'), 
  uploadExcel(), 
  adminController.uploadExcel
);
```

## 🗑️ Resim Silme

### Controller'da Kullanım
```javascript
const { deleteImage } = require('../middleware/uploadMiddleware');

// Ürün silinirken resmi de sil
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ürünü bul
    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    // Resmi sil
    if (product.image_url) {
      const imagePath = `public/images/${product.image_url}`;
      deleteImage(imagePath);
    }
    
    // Ürünü sil
    await product.destroy();
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
```

## 🔍 Utility Fonksiyonlar

### Resim URL'i Oluşturma
```javascript
const { getImageUrl } = require('../middleware/uploadMiddleware');

const imageUrl = getImageUrl('product_123.jpg', 'product');
// Sonuç: /public/images/product_123.jpg
```

### Dosya Boyutu Formatı
```javascript
const { formatFileSize } = require('../middleware/uploadMiddleware');

console.log(formatFileSize(1048576)); // "1 MB"
console.log(formatFileSize(5242880)); // "5 MB"
```

### Upload Tiplerini Listeleme
```javascript
const { listUploadTypes } = require('../middleware/uploadMiddleware');

const types = listUploadTypes();
console.log(types);
// [
//   { type: 'product', destination: 'public/images', maxSize: '5 MB', ... },
//   { type: 'announcement', destination: 'public/images', maxSize: '10 MB', ... },
//   ...
// ]
```

## ⚠️ Hata Yönetimi

### Multer Hatalarını Yakalama
```javascript
// Global error handler
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Dosya boyutu çok büyük' 
      });
    }
  }
  
  if (error.message.includes('kabul edilir')) {
    return res.status(400).json({ 
      error: error.message 
    });
  }
  
  next(error);
});
```

## 🧪 Test Etme

Test dosyasını çalıştırmak için:
```bash
cd backend
node testUploadMiddleware.js
```

## 📝 Önemli Notlar

1. **Klasör Otomatik Oluşturma**: Hedef klasör yoksa otomatik olarak oluşturulur
2. **Benzersiz Dosya Adları**: Her dosya için timestamp + random string kullanılır
3. **Güvenlik**: Sadece belirtilen dosya türleri kabul edilir
4. **Boyut Limiti**: Her upload tipi için farklı boyut limitleri
5. **Hata Mesajları**: Türkçe hata mesajları (özelleştirilebilir)

## 🔄 Eski Kod'dan Geçiş

### Eski Kod:
```javascript
const multer = require('multer');
const storage = multer.diskStorage({...});
const upload = multer({ storage, fileFilter });

router.post('/', upload.single('file'), controller.upload);
```

### Yeni Kod:
```javascript
const { uploadSingle } = require('../middleware/uploadMiddleware');

router.post('/', uploadSingle('product', 'file'), controller.upload);
```

## 🆕 Yeni Upload Tipi Ekleme

Yeni bir upload tipi eklemek için `uploadMiddleware.js` dosyasındaki `uploadConfigs` objesine ekleyin:

```javascript
const uploadConfigs = {
  // ... mevcut tipler ...
  
  // Yeni tip
  document: {
    destination: 'public/documents',
    allowedTypes: ['application/pdf', 'application/msword'],
    maxSize: 20 * 1024 * 1024, // 20MB
    filename: (file) => `doc_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`,
    errorMessage: 'Doküman için sadece PDF ve Word dosyaları kabul edilir'
  }
};
```

Bu şekilde yeni tip otomatik olarak kullanılabilir hale gelir!
