const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Upload konfigürasyonları - Her modül için özel ayarlar
 */
const uploadConfigs = {
  // Ürün resimleri
  product: {
    destination: 'public/images',
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    filename: (file) => `product_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`,
    errorMessage: 'Ürün resmi için sadece JPEG, JPG, PNG ve WebP dosyaları kabul edilir'
  },
  
  // Duyuru resimleri
  announcement: {
    destination: 'public/images',
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    filename: (file) => `announcement_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`,
    errorMessage: 'Duyuru resmi için sadece JPEG, JPG, PNG ve WebP dosyaları kabul edilir'
  },
  
  // Logo resimleri
  logo: {
    destination: 'public/logos',
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'],
    maxSize: 2 * 1024 * 1024, // 2MB
    filename: (file) => `logo_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`,
    errorMessage: 'Logo için sadece JPEG, JPG, PNG ve SVG dosyaları kabul edilir'
  },
  
  // Kategori resimleri
  category: {
    destination: 'public/images',
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    maxSize: 3 * 1024 * 1024, // 3MB
    filename: (file) => `category_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`,
    errorMessage: 'Kategori resmi için sadece JPEG, JPG ve PNG dosyaları kabul edilir'
  },
  
  // Kullanıcı avatar'ları
  avatar: {
    destination: 'public/avatars',
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    maxSize: 1 * 1024 * 1024, // 1MB
    filename: (file) => `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`,
    errorMessage: 'Avatar için sadece JPEG, JPG ve PNG dosyaları kabul edilir'
  },
  
  // Excel dosyaları
  excel: {
    destination: 'public/xlsx',
    allowedTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    filename: (file) => `excel_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`,
    errorMessage: 'Excel dosyası için sadece XLSX, XLS ve CSV dosyaları kabul edilir'
  },

  // İşletme logo'ları
  business_logo: {
    destination: 'public/logos',
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    filename: (file) => `business_logo_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`,
    errorMessage: 'İşletme logosu için sadece JPEG, JPG, PNG ve WebP dosyaları kabul edilir'
  },

  // İşletme banner'ları
  business_banner: {
    destination: 'public/images/banners',
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    filename: (file) => `business_banner_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`,
    errorMessage: 'İşletme banneri için sadece JPEG, JPG, PNG ve WebP dosyaları kabul edilir'
  },

  // Welcome background resimleri
  welcome_background: {
    destination: 'public/images/welcome_backgrounds',
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    filename: (file) => `welcome_bg_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`,
    errorMessage: 'Welcome background için sadece JPEG, JPG, PNG ve WebP dosyaları kabul edilir'
  }
};

/**
 * Multer storage oluşturucu
 * @param {Object} config - Upload konfigürasyonu
 * @returns {Object} Multer storage objesi
 */
const createStorage = (config) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Klasör yoksa oluştur
      if (!fs.existsSync(config.destination)) {
        fs.mkdirSync(config.destination, { recursive: true });
        console.log(`📁 Klasör oluşturuldu: ${config.destination}`);
      }
      cb(null, config.destination);
    },
    filename: (req, file, cb) => {
      const filename = config.filename(file);
      console.log(`📸 Dosya yükleniyor: ${filename}`);
      cb(null, filename);
    }
  });
};

/**
 * File filter oluşturucu
 * @param {Object} config - Upload konfigürasyonu
 * @returns {Function} File filter fonksiyonu
 */
const createFileFilter = (config) => {
  return (req, file, cb) => {
    console.log(`🔍 Dosya türü kontrol ediliyor: ${file.mimetype}`);
    
    if (config.allowedTypes.includes(file.mimetype)) {
      console.log(`✅ Dosya türü kabul edildi: ${file.mimetype}`);
      cb(null, true);
    } else {
      console.log(`❌ Dosya türü reddedildi: ${file.mimetype}`);
      cb(new Error(config.errorMessage), false);
    }
  };
};

/**
 * Upload middleware oluşturucu
 * @param {string} type - Upload tipi (product, announcement, logo, vb.)
 * @param {Object} options - Özel konfigürasyon seçenekleri
 * @returns {Object} Multer middleware objesi
 */
const createUploadMiddleware = (type, options = {}) => {
  const config = uploadConfigs[type];
  if (!config) {
    throw new Error(`❌ Bilinmeyen upload tipi: ${type}. Mevcut tipler: ${Object.keys(uploadConfigs).join(', ')}`);
  }
  
  // Özel konfigürasyon ile mevcut konfigürasyonu birleştir
  const finalConfig = { ...config, ...options };
  
  console.log(`🚀 Upload middleware oluşturuluyor: ${type}`);
  console.log(`📁 Hedef klasör: ${finalConfig.destination}`);
  console.log(`📏 Maksimum boyut: ${(finalConfig.maxSize / 1024 / 1024).toFixed(2)}MB`);
  
  return multer({
    storage: createStorage(finalConfig),
    fileFilter: createFileFilter(finalConfig),
    limits: {
      fileSize: finalConfig.maxSize
    }
  });
};

/**
 * Hazır middleware'ler - Kolay kullanım için
 */

// Tek dosya yükleme
const uploadSingle = (type, fieldName = 'file') => {
  return createUploadMiddleware(type).single(fieldName);
};

// Çoklu dosya yükleme
const uploadMultiple = (type, fieldName = 'files', maxCount = 5) => {
  return createUploadMiddleware(type).array(fieldName, maxCount);
};

// Farklı alanlardan dosya yükleme
const uploadFields = (type, fields) => {
  return createUploadMiddleware(type).fields(fields);
};

// Excel dosyası yükleme (özel alan adı)
const uploadExcel = () => {
  return createUploadMiddleware('excel').single('excel');
};

/**
 * Utility fonksiyonlar
 */

// Resim silme
const deleteImage = (imagePath) => {
  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`🗑️ Resim silindi: ${imagePath}`);
      return true;
    }
    console.log(`⚠️ Resim bulunamadı: ${imagePath}`);
    return false;
  } catch (error) {
    console.error(`❌ Resim silme hatası: ${error.message}`);
    return false;
  }
};

// Resim URL'i oluşturucu
const getImageUrl = (filename, type) => {
  const config = uploadConfigs[type];
  if (!config) {
    throw new Error(`❌ Bilinmeyen upload tipi: ${type}`);
  }
  
  const folderName = config.destination.split('/')[1];
  return `/public/${folderName}/${filename}`;
};

// Dosya boyutu formatı
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Upload konfigürasyonlarını listele
const listUploadTypes = () => {
  return Object.keys(uploadConfigs).map(type => ({
    type,
    destination: uploadConfigs[type].destination,
    maxSize: formatFileSize(uploadConfigs[type].maxSize),
    allowedTypes: uploadConfigs[type].allowedTypes
  }));
};

// Hata mesajlarını özelleştir
const customizeErrorMessages = (type, customMessages) => {
  if (uploadConfigs[type]) {
    uploadConfigs[type] = { ...uploadConfigs[type], ...customMessages };
    console.log(`✅ ${type} için hata mesajları özelleştirildi`);
  }
};

const { cloudflareMiddleware, CloudflareService } = require('./cloudflareMiddleware');

// Cloudflare entegrasyonlu upload middleware'leri
const createCloudflareUploadMiddleware = (type, options = {}) => {
  const multerMiddleware = createUploadMiddleware(type, options);
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) return next(err);
      cloudflareMiddleware(type)(req, res, next);
    });
  };
};

const uploadSingleToCloudflare = (type, fieldName = 'file') => {
  const multerMiddleware = uploadSingle(type, fieldName);
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) return next(err);
      cloudflareMiddleware(type)(req, res, next);
    });
  };
};

const uploadMultipleToCloudflare = (type, fieldName = 'files', maxCount = 5) => {
  const multerMiddleware = uploadMultiple(type, fieldName, maxCount);
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) return next(err);
      cloudflareMiddleware(type)(req, res, next);
    });
  };
};

// Çoklu alan için Cloudflare entegrasyonlu upload
const uploadFieldsToCloudflare = (type, fields) => {
  const multerMiddleware = uploadFields(type, fields);
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) return next(err);
      
      // Çoklu alan için özel Cloudflare middleware
      const processFiles = async () => {
        try {
          const cloudflareService = new CloudflareService();
          
          // Her bir alan için dosyaları işle
          for (const field of fields) {
            const fieldName = field.name;
            const files = req.files && req.files[fieldName];
            
            if (files && files.length > 0) {
              // Her bir dosyayı sıkıştır ve Cloudflare'e yükle
              for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const cloudPath = `${type}/${fieldName}_${path.basename(file.path)}`;
                
                // Dosyayı sıkıştır ve Cloudflare'e yükle
                const uploadResult = await cloudflareService.uploadFile(
                  file.path,
                  cloudPath,
                  file.mimetype,
                  type,
                  true // Sıkıştırma aktif
                );
                
                // Yerel dosyayı sil
                await fs.promises.unlink(file.path).catch(err => console.error(`Yerel dosya silinemedi: ${err.message}`));
                
                // Dosya bilgilerini güncelle
                files[i] = {
                  ...file,
                  cloudUrl: uploadResult.publicUrl,
                  cloudPath,
                  location: uploadResult.publicUrl,
                  compressionStats: uploadResult.compressionStats
                };
              }
            }
          }
          
          next();
        } catch (error) {
          // Hata durumunda yerel dosyaları temizle
          if (req.files) {
            Object.keys(req.files).forEach(fieldName => {
              req.files[fieldName].forEach(file => {
                if (file.path) {
                  fs.unlink(file.path, () => {});
                }
              });
            });
          }
          next(error);
        }
      };
      
      processFiles().catch(next);
    });
  };
};

module.exports = {
  // Ana fonksiyonlar
  createUploadMiddleware,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadExcel,
  
  // Cloudflare entegrasyonlu fonksiyonlar
  createCloudflareUploadMiddleware,
  uploadSingleToCloudflare,
  uploadMultipleToCloudflare,
  uploadFieldsToCloudflare,
  
  // Utility fonksiyonlar
  deleteImage,
  getImageUrl,
  formatFileSize,
  listUploadTypes,
  customizeErrorMessages,
  
  // Konfigürasyonlar
  uploadConfigs
};
