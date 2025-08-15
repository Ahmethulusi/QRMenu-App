const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Veritabanı ve modeller
const db = require('./db');
const models = require('./models');

// Router'lar
const adminRouter = require('./routes/adminRoute');
const tableQrMngRouter = require('./routes/table_qr_route');
const branchRoute = require('./routes/branchRoute');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const permissionRoute = require('./routes/permissionRoute');
const labelRoute = require('./routes/labelRoute');
const announcementRoute = require('./routes/announcementRoute');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// Router kullanımı
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRouter);
app.use('/api/table_qr', tableQrMngRouter);
app.use("/api/branches",branchRoute);
app.use('/api/users', userRoute);
app.use('/api/permissions', permissionRoute);
app.use('/api/labels', labelRoute);
app.use('/api/announcements', announcementRoute);

// Veritabanı bağlantısı ve senkronizasyon
(async () => {
  try {
    await db.authenticate();
    console.log('✅ Veritabanına başarıyla bağlanıldı.');

    await db.sync({ force: false });
    console.log('✅ Veritabanı senkronize edildi.');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
    });
  } catch (error) {
    console.error('❌ Veritabanı bağlantı/senkronizasyon hatası:', error);
  }
})();