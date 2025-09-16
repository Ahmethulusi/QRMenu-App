const sequelize = require('../db');
const { DataTypes } = require('sequelize');

async function up() {
  try {
    // Önce geçici bir table_no kolonu ekleyelim
    await sequelize.query(`
      ALTER TABLE tables ADD COLUMN table_no INTEGER;
    `);
    
    // Mevcut table_name değerlerini sayıya çevirelim (eğer mümkünse)
    // Sayıya çevrilemeyenler için sıralı numara atayalım
    await sequelize.query(`
      UPDATE tables 
      SET table_no = CASE 
        WHEN table_name ~ '^[0-9]+$' THEN table_name::INTEGER
        ELSE (SELECT COUNT(*) FROM tables t2 WHERE t2.id <= tables.id)
      END;
    `);
    
    // table_no kolonunu NOT NULL yapalım
    await sequelize.query(`
      ALTER TABLE tables ALTER COLUMN table_no SET NOT NULL;
    `);
    
    // table_name kolonunu kaldıralım
    await sequelize.query(`
      ALTER TABLE tables DROP COLUMN table_name;
    `);
    
    console.log('✅ Migrasyon başarılı: table_name -> table_no dönüşümü tamamlandı');
  } catch (error) {
    console.error('❌ Migrasyon hatası:', error);
    throw error;
  }
}

async function down() {
  try {
    // Geri alma işlemi için önce table_name kolonunu ekleyelim
    await sequelize.query(`
      ALTER TABLE tables ADD COLUMN table_name VARCHAR(255);
    `);
    
    // table_no değerlerini string olarak table_name'e kopyalayalım
    await sequelize.query(`
      UPDATE tables SET table_name = table_no::VARCHAR;
    `);
    
    // table_name kolonunu NOT NULL yapalım
    await sequelize.query(`
      ALTER TABLE tables ALTER COLUMN table_name SET NOT NULL;
    `);
    
    // table_no kolonunu kaldıralım
    await sequelize.query(`
      ALTER TABLE tables DROP COLUMN table_no;
    `);
    
    console.log('✅ Geri alma başarılı: table_no -> table_name dönüşümü tamamlandı');
  } catch (error) {
    console.error('❌ Geri alma hatası:', error);
    throw error;
  }
}

module.exports = { up, down };
