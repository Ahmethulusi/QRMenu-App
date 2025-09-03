const { Sequelize, DataTypes } = require('sequelize');
const db = require('../db');

async function updateDatabaseForERP() {
  try {
    console.log('🔄 ERP entegrasyonu için veritabanı güncelleniyor...');

    // Users tablosuna ERP alanları ekle
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS erp_server VARCHAR(100),
      ADD COLUMN IF NOT EXISTS erp_database VARCHAR(50),
      ADD COLUMN IF NOT EXISTS erp_username VARCHAR(50),
      ADD COLUMN IF NOT EXISTS erp_password VARCHAR(200),
      ADD COLUMN IF NOT EXISTS erp_port INTEGER DEFAULT 1433,
      ADD COLUMN IF NOT EXISTS erp_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS last_sync_date TIMESTAMP;
    `);
    console.log('✅ Users tablosu güncellendi');

    // Categories tablosuna ERP alanları ekle
    await db.query(`
      ALTER TABLE categories 
      ADD COLUMN IF NOT EXISTS category_code VARCHAR(50) UNIQUE,
      ADD COLUMN IF NOT EXISTS business_id INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);
    console.log('✅ Categories tablosu güncellendi');

    // Products tablosuna ERP alanları ekle
    await db.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS product_code VARCHAR(50) UNIQUE,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);
    console.log('✅ Products tablosu güncellendi');

    // Foreign key constraint ekle (eğer yoksa)
    try {
      await db.query(`
        ALTER TABLE categories 
        ADD CONSTRAINT fk_categories_business 
        FOREIGN KEY (business_id) REFERENCES businesses(id);
      `);
      console.log('✅ Categories business foreign key eklendi');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Categories business foreign key zaten mevcut');
      } else {
        throw error;
      }
    }

    // Index'ler ekle
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_categories_category_code ON categories(category_code);
      CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
      CREATE INDEX IF NOT EXISTS idx_users_erp_enabled ON users(erp_enabled);
    `);
    console.log('✅ Index\'ler eklendi');

    console.log('🎉 ERP entegrasyonu için veritabanı güncellemesi tamamlandı!');

  } catch (error) {
    console.error('❌ Veritabanı güncelleme hatası:', error);
    throw error;
  }
}

// Script çalıştırılıyorsa
if (require.main === module) {
  updateDatabaseForERP()
    .then(() => {
      console.log('✅ Script başarıyla tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script hatası:', error);
      process.exit(1);
    });
}

module.exports = updateDatabaseForERP;
