require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Veritabanı ve modeller
const db = require('./db');
const models = require('./models');

// Cron job servisleri
const { startCurrencyCronJobs } = require('./services/currencyCronService');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// Router'lar
const adminRouter = require('./routes/adminRoute');
const tableQrMngRouter = require('./routes/table_qr_route');
const branchRoute = require('./routes/branchRoute');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const permissionRoute = require('./routes/permissionRoute');
const labelRoute = require('./routes/labelRoute');
const announcementRoute = require('./routes/announcementRoute');
const languageRoute = require('./routes/languageRoute');
const translationRoute = require('./routes/translationRoute');
const erpRoute = require('./routes/erpRoute');
const erpTestRoute = require('./routes/erpTestRoute');
const currencyRoute = require('./routes/currencyRoute');

// Router kullanımı
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRouter);
app.use('/api/table_qr', tableQrMngRouter);
app.use("/api/branches",branchRoute);
app.use('/api/users', userRoute);
app.use('/api/permissions', permissionRoute);
app.use('/api/labels', labelRoute);
app.use('/api/announcements', announcementRoute);
app.use('/api/languages', languageRoute);
app.use('/api/translations', translationRoute);
app.use('/api/erp', erpRoute);
app.use('/api/erp-test', erpTestRoute);
app.use('/api/currencies', currencyRoute);



// Veritabanı bağlantısı ve senkronizasyon
(async () => {
  try {
    await db.authenticate();
    console.log('✅ Veritabanına başarıyla bağlanıldı.');

    await db.sync({ force: false });
    console.log('✅ Veritabanı senkronize edildi.');

    // Cron job'ları başlat
    startCurrencyCronJobs();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
    });
  } catch (error) {
    console.error('❌ Veritabanı bağlantı/senkronizasyon hatası:', error);
  }
})();