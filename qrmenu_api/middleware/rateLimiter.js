const rateLimit = require('express-rate-limit');

/**
 * Genel Rate Limiter
 * Tüm endpoint'ler için
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum 100 istek
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. 15 dakika sonra tekrar deneyin.',
    code: 'RATE_LIMIT_EXCEEDED',
    retry_after: '15 minutes'
  },
  standardHeaders: true, // Rate limit bilgilerini header'da döndür
  legacyHeaders: false,
  // IP adresi alma
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Skip successful requests
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: false
});

/**
 * Menü API'si için özel limiter
 * Daha gevşek limitler (müşteri kullanımı)
 */
const menuLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  max: 50, // IP başına maksimum 50 istek
  message: {
    success: false,
    message: 'Menü görüntüleme limiti aşıldı. 5 dakika sonra tekrar deneyin.',
    code: 'MENU_RATE_LIMIT_EXCEEDED',
    retry_after: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * QR kod doğrulama için limiter
 * Daha sıkı limitler (güvenlik)
 */
const qrLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 10, // IP başına maksimum 10 istek
  message: {
    success: false,
    message: 'QR kod doğrulama limiti aşıldı. 1 dakika sonra tekrar deneyin.',
    code: 'QR_RATE_LIMIT_EXCEEDED',
    retry_after: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Dil API'si için limiter
 * Orta düzey limitler
 */
const languageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 dakika
  max: 30, // IP başına maksimum 30 istek
  message: {
    success: false,
    message: 'Dil API limiti aşıldı. 10 dakika sonra tekrar deneyin.',
    code: 'LANGUAGE_RATE_LIMIT_EXCEEDED',
    retry_after: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  menuLimiter,
  qrLimiter,
  languageLimiter
};
