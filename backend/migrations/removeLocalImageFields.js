const path = require('path');

// .env dosyasını backend klasöründen yükle (migrations klasöründen çalıştırıldığında)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Sequelize ve modelleri doğrudan backend'den import et
const sequelize = require('../db');

async function removeLocalImageFields() {
  try {
    console.log('⚠️ UYARI: Bu script yerel dosya referanslarını kaldıracak!');
    console.log('⚠️ Devam etmeden önce tüm dosyaların Cloudflare\'e migrate edildiğinden emin olun!');
    
    // 5 saniye bekle
    console.log('İptal etmek için Ctrl+C tuşlarına basın. 5 saniye içinde devam edilecek...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🔄 Yerel dosya alanları kaldırılıyor...');

    // Products tablosundan yerel resim alanlarını kaldır
    console.log('Products tablosu güncelleniyor...');
    await sequelize.query(`
      ALTER TABLE products 
      DROP COLUMN IF EXISTS image_url,
      DROP COLUMN IF EXISTS resim;
    `);

    // Category tablosundan yerel resim alanlarını kaldır
    console.log('Categories tablosu güncelleniyor...');
    await sequelize.query(`
      ALTER TABLE categories 
      DROP COLUMN IF EXISTS image_url,
      DROP COLUMN IF EXISTS resim;
    `);

    // Announcement tablosundan yerel resim alanlarını kaldır
    console.log('Announcements tablosu güncelleniyor...');
    await sequelize.query(`
      ALTER TABLE announcements 
      DROP COLUMN IF EXISTS image_url,
      DROP COLUMN IF EXISTS image,
      DROP COLUMN IF EXISTS background_image_url,
      DROP COLUMN IF EXISTS background_image;
    `);

    // Business tablosundan yerel resim alanlarını kaldır
    console.log('Businesses tablosu güncelleniyor...');
    await sequelize.query(`
      ALTER TABLE businesses 
      DROP COLUMN IF EXISTS logo,
      DROP COLUMN IF EXISTS banner_images,
      DROP COLUMN IF EXISTS welcome_background;
    `);

    console.log('✅ Yerel dosya alanları başarıyla kaldırıldı');
    process.exit(0);
  } catch (error) {
    console.error('❌ Yerel dosya alanlarını kaldırma hatası:', error);
    process.exit(1);
  } finally {
    // Bağlantıyı kapat
    await sequelize.close();
  }
}

// Bu scripti doğrudan çalıştırmak yerine bir onay mekanizması ekleyelim
if (process.argv.includes('--confirm')) {
  removeLocalImageFields();
} else {
  console.log('⚠️ UYARI: Bu script geri alınamaz ve yerel dosya referanslarını tamamen kaldırır!');
  console.log('Çalıştırmak için: node removeLocalImageFields.js --confirm');
  process.exit(0);
}
