const path = require('path');

// .env dosyasını backend klasöründen yükle (migrations klasöründen çalıştırıldığında)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Sequelize ve modelleri doğrudan backend'den import et
const sequelize = require('../db');

async function createIngredientsTable() {
  try {
    console.log('🔄 ingredients tablosu oluşturuluyor...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        ingredient_id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('ekstra', 'çıkarılacak')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_ingredients_product FOREIGN KEY (product_id)
          REFERENCES products(product_id) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Index for faster lookups by product
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_product_id ON ingredients(product_id);
    `);

    console.log('✅ ingredients tablosu hazır');
    process.exit(0);
  } catch (error) {
    console.error('❌ ingredients tablosu oluşturma hatası:', error);
    process.exit(1);
  } finally {
    // Bağlantıyı kapat
    await sequelize.close();
  }
}

createIngredientsTable();
