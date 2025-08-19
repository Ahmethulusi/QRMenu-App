const { Sequelize } = require('sequelize');
const sequelize = require('./db');
const { Announcement } = require('./models');

/**
 * Bu script, Announcement tablosunu güncellemek için kullanılır.
 * Yeni eklenen alanları veritabanına ekler.
 */
const syncAnnouncementTable = async () => {
  try {
    console.log('🔄 Announcement tablosu senkronizasyonu başlatılıyor...');
    
    // Mevcut tabloyu kontrol et
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('announcements');
    console.log('📊 Mevcut tablo yapısı:', Object.keys(tableInfo));
    
    // Yeni alanları ekle
    const newFields = [
      { name: 'type', type: 'ENUM', values: ['promotion', 'campaign', 'discount', 'general'] },
      { name: 'discount_type', type: 'ENUM', values: ['amount', 'percentage'] },
      { name: 'discount_value', type: 'DECIMAL', options: { precision: 10, scale: 2 } },
      { name: 'applicable_products', type: 'JSON' },
      { name: 'applicable_categories', type: 'JSON' },
      { name: 'campaign_condition', type: 'STRING', options: { length: 500 } },
      { name: 'campaign_reward', type: 'STRING', options: { length: 500 } }
    ];
    
    // Her bir alanı kontrol et ve yoksa ekle
    for (const field of newFields) {
      if (!tableInfo[field.name]) {
        console.log(`➕ '${field.name}' alanı ekleniyor...`);
        
        let columnDefinition = { allowNull: true };
        
        if (field.type === 'ENUM') {
          // ENUM tipi için özel işlem
          columnDefinition.type = Sequelize.ENUM(...field.values);
        } else if (field.options) {
          // Opsiyonları olan tipler için
          columnDefinition.type = Sequelize[field.type](field.options);
        } else {
          // Standart tipler için
          columnDefinition.type = Sequelize[field.type];
        }
        
        await queryInterface.addColumn('announcements', field.name, columnDefinition);
        console.log(`✅ '${field.name}' alanı başarıyla eklendi.`);
      } else {
        console.log(`ℹ️ '${field.name}' alanı zaten mevcut.`);
      }
    }
    
    // Mevcut kayıtları güncelle - type alanını 'general' olarak ayarla
    if (tableInfo['type']) {
      const [updated] = await sequelize.query(`
        UPDATE announcements 
        SET type = 'general' 
        WHERE type IS NULL
      `);
      console.log(`🔄 ${updated} kayıt güncellendi, type = 'general' olarak ayarlandı.`);
    }
    
    console.log('✅ Announcement tablosu senkronizasyonu tamamlandı.');
  } catch (error) {
    console.error('❌ Senkronizasyon hatası:', error);
  } finally {
    process.exit();
  }
};

// Scripti çalıştır
syncAnnouncementTable();
