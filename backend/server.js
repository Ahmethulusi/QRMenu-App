const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Veritabanı ve modeller
const db = require('./db');
const models = require('./models'); // ./models/index.js üzerinden

// Router'lar
const adminRouter = require('./routes/adminRoute');
const tableQrMngRouter = require('./routes/table_qr_route');
const branchRoute = require('./routes/branchRoute');

// Middleware
app.use(cors());
// app.use(cors({
//   origin: 'https://qrmenu-app-frontend.onrender.com', // Render'daki frontend adresi
//   credentials: true // Eğer cookie vs. varsa
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// Router kullanımı
app.use('/api/admin', adminRouter);
app.use('/api/table_qr', tableQrMngRouter);
app.use("/api/branches",branchRoute);
// app.use('/api/auth', authRouter);

// Veritabanı bağlantısı ve senkronizasyon
(async () => {
  try {
    await db.authenticate();
    console.log('✅ Veritabanına başarıyla bağlanıldı.');

    await db.sync({ force: false }); // değişikliklere göre tabloyu günceller
    console.log('✅ Veritabanı senkronize edildi.');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
    });
  } catch (error) {
    console.error('❌ Veritabanı bağlantı/senkronizasyon hatası:', error);
  }
})();