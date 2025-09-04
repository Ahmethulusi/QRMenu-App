const path = require('path');

// .env dosyasını backend klasöründen yükle (migrations klasöründen çalıştırıldığında)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Sequelize ve modelleri doğrudan backend'den import et
const sequelize = require('../db');

async function createRecommendedProductsTable() {
  try {
    console.log('🔄 recommended_products tablosu oluşturuluyor...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS recommended_products (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        recommended_product_id INTEGER NOT NULL,
        additional_price DOUBLE PRECISION DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_recommended_main_product FOREIGN KEY (product_id)
          REFERENCES products(product_id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT fk_recommended_product FOREIGN KEY (recommended_product_id)
          REFERENCES products(product_id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT unique_product_recommendation UNIQUE (product_id, recommended_product_id)
      );
    `);

    // Index for faster lookups by product
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_recommended_product_id ON recommended_products(product_id);
    `);

    console.log('✅ recommended_products tablosu hazır');
    process.exit(0);
  } catch (error) {
    console.error('❌ recommended_products tablosu oluşturma hatası:', error);
    process.exit(1);
  } finally {
    // Bağlantıyı kapat
    await sequelize.close();
  }
}

createRecommendedProductsTable();