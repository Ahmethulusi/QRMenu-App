/**
 * Global Error Handler Middleware
 * Tüm hataları yakalar ve standart format döner
 */

const errorHandler = (err, req, res, next) => {
  console.error('🔴 ERROR:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Varsayılan hata
  let error = {
    success: false,
    message: 'Sunucu hatası',
    code: 'SERVER_ERROR',
    timestamp: new Date().toISOString()
  };

  // Sequelize hataları
  if (err.name === 'SequelizeValidationError') {
    error.message = 'Geçersiz veri';
    error.code = 'VALIDATION_ERROR';
    error.details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json(error);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error.message = 'İlişkili veri bulunamadı';
    error.code = 'FOREIGN_KEY_ERROR';
    return res.status(400).json(error);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Bu veri zaten mevcut';
    error.code = 'DUPLICATE_ERROR';
    return res.status(409).json(error);
  }

  if (err.name === 'SequelizeDatabaseError') {
    error.message = 'Veritabanı hatası';
    error.code = 'DATABASE_ERROR';
    return res.status(500).json(error);
  }

  if (err.name === 'SequelizeConnectionError') {
    error.message = 'Veritabanı bağlantı hatası';
    error.code = 'DB_CONNECTION_ERROR';
    return res.status(503).json(error);
  }

  // JSON parse hataları
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.message = 'Geçersiz JSON formatı';
    error.code = 'INVALID_JSON';
    return res.status(400).json(error);
  }

  // Rate limiting hataları
  if (err.status === 429) {
    error.message = 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.';
    error.code = 'RATE_LIMIT_EXCEEDED';
    error.retry_after = err.retryAfter;
    return res.status(429).json(error);
  }

  // Özel hata kodları
  if (err.code) {
    error.code = err.code;
    error.message = err.message;
    
    // HTTP status kodunu belirle
    const statusCode = err.statusCode || 
                      (err.code.includes('NOT_FOUND') ? 404 :
                       err.code.includes('VALIDATION') ? 400 :
                       err.code.includes('UNAUTHORIZED') ? 401 :
                       err.code.includes('FORBIDDEN') ? 403 : 500);
    
    return res.status(statusCode).json(error);
  }

  // Development modunda detayları göster
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = err.message;
  }

  // Varsayılan 500 hatası
  res.status(500).json(error);
};

/**
 * 404 Handler - Route bulunamadı
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

/**
 * Async Error Wrapper
 * Async fonksiyonlardaki hataları yakalamak için
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
