/**
 * Request Validation Middleware
 * İstek verilerini doğrular
 */

/**
 * Branch ID doğrulama
 */
const validateBranchId = (req, res, next) => {
  const { branchId } = req.params;
  
  if (!branchId) {
    return res.status(400).json({
      success: false,
      message: 'Şube ID gereklidir',
      code: 'BRANCH_ID_REQUIRED'
    });
  }
  
  if (isNaN(branchId) || parseInt(branchId) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Geçerli bir şube ID gönderiniz',
      code: 'INVALID_BRANCH_ID'
    });
  }
  
  req.branchId = parseInt(branchId);
  next();
};

/**
 * Product ID doğrulama
 */
const validateProductId = (req, res, next) => {
  const { productId } = req.params;
  
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Ürün ID gereklidir',
      code: 'PRODUCT_ID_REQUIRED'
    });
  }
  
  if (isNaN(productId) || parseInt(productId) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Geçerli bir ürün ID gönderiniz',
      code: 'INVALID_PRODUCT_ID'
    });
  }
  
  req.productId = parseInt(productId);
  next();
};

/**
 * Category ID doğrulama
 */
const validateCategoryId = (req, res, next) => {
  const { categoryId } = req.params;
  
  if (!categoryId) {
    return res.status(400).json({
      success: false,
      message: 'Kategori ID gereklidir',
      code: 'CATEGORY_ID_REQUIRED'
    });
  }
  
  if (isNaN(categoryId) || parseInt(categoryId) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Geçerli bir kategori ID gönderiniz',
      code: 'INVALID_CATEGORY_ID'
    });
  }
  
  req.categoryId = parseInt(categoryId);
  next();
};

/**
 * Dil kodu doğrulama
 */
const validateLanguageCode = (req, res, next) => {
  const lang = req.query.lang || req.params.langCode || 'tr';
  
  // Desteklenen dil kodları
  const supportedLangs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'ru'];
  
  if (!supportedLangs.includes(lang.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Desteklenmeyen dil kodu: ${lang}. Desteklenen diller: ${supportedLangs.join(', ')}`,
      code: 'UNSUPPORTED_LANGUAGE',
      supported_languages: supportedLangs
    });
  }
  
  req.lang = lang.toLowerCase();
  next();
};

/**
 * QR kod doğrulama
 */
const validateQRCode = (req, res, next) => {
  const { qrCode } = req.params;
  
  if (!qrCode) {
    return res.status(400).json({
      success: false,
      message: 'QR kod gereklidir',
      code: 'QR_CODE_REQUIRED'
    });
  }
  
  if (qrCode.length < 5) {
    return res.status(400).json({
      success: false,
      message: 'QR kod çok kısa',
      code: 'QR_CODE_TOO_SHORT'
    });
  }
  
  if (qrCode.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'QR kod çok uzun',
      code: 'QR_CODE_TOO_LONG'
    });
  }
  
  next();
};

/**
 * Query parametrelerini temizle ve doğrula
 */
const sanitizeQuery = (req, res, next) => {
  // Lang parametresi
  if (req.query.lang) {
    req.query.lang = req.query.lang.toString().toLowerCase().trim();
  }
  
  // Sayfa parametreleri
  if (req.query.page) {
    const page = parseInt(req.query.page);
    req.query.page = (isNaN(page) || page < 1) ? 1 : page;
  }
  
  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    req.query.limit = (isNaN(limit) || limit < 1) ? 10 : Math.min(limit, 100);
  }
  
  // Category filter
  if (req.query.category) {
    const category = parseInt(req.query.category);
    if (isNaN(category) || category <= 0) {
      delete req.query.category;
    } else {
      req.query.category = category;
    }
  }
  
  next();
};

/**
 * Request body doğrulama (POST istekleri için)
 */
const validateRequestBody = (req, res, next) => {
  if (req.method === 'POST' && (!req.body || Object.keys(req.body).length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Request body gereklidir',
      code: 'REQUEST_BODY_REQUIRED'
    });
  }
  
  next();
};

// Middleware for validating announcementId
const validateAnnouncementId = (req, res, next) => {
  const announcementId = req.params.id || req.params.announcementId || req.query.announcementId;
  if (!announcementId || !isValidId(announcementId)) {
    return next(new AppError('Geçersiz veya eksik duyuru ID', 400, 'INVALID_ANNOUNCEMENT_ID'));
  }
  req.params.id = parseInt(announcementId); // Convert to integer
  next();
};

module.exports = {
  validateBranchId,
  validateProductId,
  validateCategoryId,
  validateLanguageCode,
  validateQRCode,
  sanitizeQuery,
  validateRequestBody,
  validateAnnouncementId
};
