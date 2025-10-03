require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Veritabanı bağlantısı
const db = require('./db');

// Middleware imports
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter, menuLimiter, qrLimiter, languageLimiter } = require('./middleware/rateLimiter');
const { securityHeaders, sanitizeInput, requestInfo, requestLogger } = require('./middleware/security');
const { sanitizeQuery } = require('./middleware/validation');

// Trust proxy (for rate limiting)
app.set('trust proxy', 1);

// Security middleware (en başta)
app.use(securityHeaders);
app.use(requestInfo);
app.use(requestLogger);

// Input sanitization
app.use(sanitizeInput);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Query sanitization
app.use(sanitizeQuery);

// Global rate limiting
app.use(generalLimiter);

// Routes
const qrRoute = require('./routes/qrRoute');
const menuRoute = require('./routes/menuRoute');
const productRoute = require('./routes/productRoute');
const languageRoute = require('./routes/languageRoute');
const currencyRoute = require('./routes/currencyRoute');
const announcementRoute = require('./routes/announcementRoute');
const labelRoute = require('./routes/labelRoute');
const businessRoute = require('./routes/businessRoute');

// Route-specific rate limiting
app.use('/api/qr', qrLimiter, qrRoute);
app.use('/api/menu', menuLimiter, menuRoute);
app.use('/api/product', menuLimiter, productRoute);
app.use('/api/languages', languageLimiter, languageRoute);
app.use('/api/currencies', languageLimiter, currencyRoute);
app.use('/api/announcements', menuLimiter, announcementRoute);
app.use('/api/labels', menuLimiter, labelRoute);
app.use('/api/business', menuLimiter, businessRoute);

// Health check endpointn
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'QR Menu API çalışıyor',
    timestamp: new Date().toISOString()
  });
});

// Veritabanı bağlantı testi endpoint'i
app.get('/api/db-test', async (req, res) => {
  try {
    await db.authenticate();
    res.json({
      success: true,
      message: 'Veritabanı bağlantısı başarılı',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Veritabanı bağlantı hatası',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});


// Veritabanı bağlantısı ve sunucu başlatma
(async () => {
  try {
    console.log('🔄 Veritabanına bağlanmaya çalışılıyor...');
    await db.authenticate();
    console.log('✅ QR Menu API - Veritabanına başarıyla bağlanıldı.');

    const PORT = process.env.QR_MENU_PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 QR Menu API ${PORT} portunda çalışıyor...`);
      console.log(`📊 DB Test: http://localhost:${PORT}/api/db-test`);
      console.log(`💓 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ QR Menu API - Veritabanı bağlantı hatası:', error.message);
    console.log('⚠️ Veritabanı olmadan sunucu başlatılıyor...');
    
    const PORT = process.env.QR_MENU_PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 QR Menu API ${PORT} portunda çalışıyor (Veritabanı bağlantısı yok)...`);
      console.log(`💓 Health: http://localhost:${PORT}/api/health`);
      console.log(`📊 DB Test: http://localhost:${PORT}/api/db-test (test etmek için)`);
    });
  }
})();

// 404 Handler (tüm route'lardan sonra)
app.use(notFoundHandler);

// Global Error Handler (en son)
app.use(errorHandler);

module.exports = app;