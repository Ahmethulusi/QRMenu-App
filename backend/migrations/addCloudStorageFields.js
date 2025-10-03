const path = require('path');

// .env dosyasını backend klasöründen yükle (migrations klasöründen çalıştırıldığında)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Sequelize ve modelleri doğrudan backend'den import et
const sequelize = require('../db');

async function addCloudStorageFields() {
  try {
    console.log('🔄 Cloudflare storage alanları ekleniyor...');

    // Products tablosuna cloudurl ve cloudpath alanları ekle
    console.log('Products tablosu güncelleniyor...');
    await sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS cloudurl VARCHAR(500) NULL,
      ADD COLUMN IF NOT EXISTS cloudpath VARCHAR(255) NULL;
    `);

    // Category tablosuna cloudurl ve cloudpath alanları ekle
    console.log('Categories tablosu güncelleniyor...');
    await sequelize.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS cloudurl VARCHAR(500) NULL,
      ADD COLUMN IF NOT EXISTS cloudpath VARCHAR(255) NULL;
    `);

    // Announcement tablosuna cloud alanları ekle
    console.log('Announcements tablosu güncelleniyor...');
    await sequelize.query(`
      ALTER TABLE announcements 
      ADD COLUMN IF NOT EXISTS imagecloudurl VARCHAR(500) NULL,
      ADD COLUMN IF NOT EXISTS imagecloudpath VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS backgroundimagecloudurl VARCHAR(500) NULL,
      ADD COLUMN IF NOT EXISTS backgroundimagecloudpath VARCHAR(255) NULL;
    `);

    // Business tablosuna cloud alanları ekle
    console.log('Businesses tablosu güncelleniyor...');
    await sequelize.query(`
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS logocloudurl VARCHAR(500) NULL,
      ADD COLUMN IF NOT EXISTS logocloudpath VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS bannercloudurl TEXT NULL,
      ADD COLUMN IF NOT EXISTS bannercloudpath TEXT NULL,
      ADD COLUMN IF NOT EXISTS welcomebackgroundcloudurl VARCHAR(500) NULL,
      ADD COLUMN IF NOT EXISTS welcomebackgroundcloudpath VARCHAR(255) NULL;
    `);

    console.log('✅ Cloudflare storage alanları başarıyla eklendi');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cloudflare storage alanları ekleme hatası:', error);
    process.exit(1);
  } finally {
    // Bağlantıyı kapat
    await sequelize.close();
  }
}

addCloudStorageFields();
