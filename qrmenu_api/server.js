require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'QR Menu API çalışıyor (Veritabanı bağlantısı olmadan)'
  });
});

// Veritabanı bağlantısı olmadan sunucu başlatma
const PORT = process.env.QR_MENU_PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 QR Menu API ${PORT} portunda çalışıyor (Veritabanı bağlantısı olmadan)...`);
});

module.exports = app;