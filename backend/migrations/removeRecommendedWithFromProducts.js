const path = require('path');

// .env dosyasını backend klasöründen yükle (migrations klasöründen çalıştırıldığında)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Sequelize ve modelleri doğrudan backend'den import et
const sequelize = require('../db');

async function removeRecommendedWithFromProducts() {
  try {
    console.log('🔄 products tablosundan recommended_with alanı kaldırılıyor...');

    // Önce alanın var olup olmadığını kontrol et
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='recommended_with';
    `;
    
    const [checkResult] = await sequelize.query(checkColumnQuery);
    
    if (checkResult.length > 0) {
      // Eğer alan varsa kaldır
      await sequelize.query(`
        ALTER TABLE products DROP COLUMN IF EXISTS recommended_with;
      `);
      console.log('✅ recommended_with alanı başarıyla kaldırıldı');
    } else {
      console.log('ℹ️ recommended_with alanı zaten mevcut değil');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ recommended_with alanı kaldırma hatası:', error);
    process.exit(1);
  } finally {
    // Bağlantıyı kapat
    await sequelize.close();
  }
}

removeRecommendedWithFromProducts();
