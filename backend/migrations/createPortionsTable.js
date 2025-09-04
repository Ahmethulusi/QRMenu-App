const path = require('path');

// .env dosyasını backend klasöründen yükle (migrations klasöründen çalıştırıldığında)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Sequelize ve modelleri doğrudan backend'den import et
const sequelize = require('../db');

async function createPortionsTable() {
  try {
    console.log('🔄 portions tablosu oluşturuluyor...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS portions (
        portion_id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        quantity VARCHAR(50) NULL,
        price DOUBLE PRECISION NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_portions_product FOREIGN KEY (product_id)
          REFERENCES products(product_id) ON UPDATE CASCADE ON DELETE CASCADE
      );
    `);

    // Index for faster lookups by product
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_portions_product_id ON portions(product_id);
    `);

    console.log('✅ portions tablosu hazır');
    process.exit(0);
  } catch (error) {
    console.error('❌ portions tablosu oluşturma hatası:', error);
    process.exit(1);
  } finally {
    // Bağlantıyı kapat
    await sequelize.close();
  }
}

createPortionsTable();


