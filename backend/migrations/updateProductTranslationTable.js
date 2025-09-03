const { sequelize } = require('../models');

async function updateProductTranslationTable() {
  try {
    console.log('🔄 ProductTranslation tablosu güncelleniyor...');
    
    // recommended_with sütununu kaldır
    await sequelize.query('ALTER TABLE product_translations DROP COLUMN IF EXISTS recommended_with');
    
    console.log('✅ recommended_with sütunu kaldırıldı');
    console.log('✅ ProductTranslation tablosu güncellendi');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    process.exit(1);
  }
}

updateProductTranslationTable();
