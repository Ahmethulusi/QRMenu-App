const { sequelize } = require('../models');

const updateLanguageTable = async () => {
  try {
    console.log('🔄 Languages tablosu güncelleniyor...');
    
    // default_currency_code alanını ekle
    await sequelize.query(`
      ALTER TABLE languages 
      ADD COLUMN default_currency_code VARCHAR(3) NULL
    `);
    
    console.log('✅ default_currency_code alanı başarıyla eklendi');
    
    // Foreign key constraint ekle (eğer currencies tablosu varsa)
    try {
      await sequelize.query(`
        ALTER TABLE languages 
        ADD CONSTRAINT fk_languages_default_currency 
        FOREIGN KEY (default_currency_code) 
        REFERENCES currencies(code)
      `);
      console.log('✅ Foreign key constraint eklendi');
    } catch (error) {
      console.log('⚠️ Foreign key constraint eklenemedi (currencies tablosu henüz yok olabilir):', error.message);
    }
    
    console.log('✅ Languages tablosu güncelleme tamamlandı');
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('⚠️ default_currency_code alanı zaten mevcut');
    } else {
      console.error('❌ Languages tablosu güncelleme hatası:', error.message);
    }
  }
};

// Eğer bu dosya doğrudan çalıştırılıyorsa
if (require.main === module) {
  updateLanguageTable().then(() => {
    console.log('✅ İşlem tamamlandı');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ İşlem başarısız:', error);
    process.exit(1);
  });
}

module.exports = { updateLanguageTable };
