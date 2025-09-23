/**
 * Security Middleware
 * Güvenlik header'ları ve koruma önlemleri
 */

/**
 * Güvenlik header'larını ekle
 */
const securityHeaders = (req, res, next) => {
  // CORS headers (daha detaylı kontrol)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 saat
  
  // Güvenlik headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('X-Powered-By', 'QR Menu API'); // Custom header
  
  // API versiyonu
  res.header('API-Version', '1.0.0');
  
  // Content Security Policy (basit)
  res.header('Content-Security-Policy', "default-src 'self'");
  
  // OPTIONS request'leri için
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

/**
 * Request sanitization
 * Zararlı karakterleri temizle
 */
const sanitizeInput = (req, res, next) => {
  // Query parametrelerini temizle
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      // HTML karakterlerini encode et
      req.query[key] = req.query[key]
        .replace(/[<>]/g, '')
        .trim();
    }
  }
  
  // URL parametrelerini temizle
  for (const key in req.params) {
    if (typeof req.params[key] === 'string') {
      req.params[key] = req.params[key]
        .replace(/[<>]/g, '')
        .trim();
    }
  }
  
  // Body'yi temizle (eğer varsa)
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/[<>]/g, '')
          .trim();
      }
    }
  }
  
  next();
};

/**
 * IP ve User-Agent kontrolü
 */
const requestInfo = (req, res, next) => {
  // IP adresini al
  req.clientIP = req.ip || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                 'unknown';
  
  // User-Agent kontrolü
  const userAgent = req.get('User-Agent') || 'unknown';
  req.userAgent = userAgent;
  
  // Şüpheli bot kontrolü (basit)
  const suspiciousBots = ['bot', 'crawler', 'spider', 'scraper'];
  const isSuspicious = suspiciousBots.some(bot => 
    userAgent.toLowerCase().includes(bot)
  );
  
  if (isSuspicious) {
    console.log(`🤖 Suspicious bot detected: ${userAgent} from ${req.clientIP}`);
  }
  
  next();
};

/**
 * Request logger
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Response'u intercept et
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log formatı
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.clientIP,
      userAgent: req.userAgent,
      size: data ? Buffer.byteLength(data, 'utf8') : 0
    };
    
    // Renk kodları (terminal için)
    const statusColor = res.statusCode >= 400 ? '🔴' : 
                       res.statusCode >= 300 ? '🟡' : '🟢';
    
    console.log(`${statusColor} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.clientIP}`);
    
    // Development modunda detaylı log
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Request Details:', logData);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  securityHeaders,
  sanitizeInput,
  requestInfo,
  requestLogger
};
