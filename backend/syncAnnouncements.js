const sequelize = require('./db');
const { Announcement } = require('./models');

/**
 * Bu script, Announcement modelini veritabanı ile senkronize eder.
 * Modelde tanımlanan alanları veritabanına ekler.
 * 
 * NOT: Bu işlem mevcut verileri korur, ancak yeni alanlar ekler.
 */
const syncAnnouncementModel = async () => {
  try {
    console.log('🔄 Announcement modeli senkronizasyonu başlatılıyor...');
    
    // Mevcut tabloyu değiştirmeden yeni alanları ekle
    await Announcement.sync({ alter: true });
    
    console.log('✅ Announcement modeli başarıyla senkronize edildi.');
    
    // Mevcut kayıtları güncelle - type alanını 'general' olarak ayarla
    const [updatedCount] = await sequelize.query(`
      UPDATE announcements 
      SET type = 'general' 
      WHERE type IS NULL
    `);
    
    console.log(`🔄 ${updatedCount} kayıt güncellendi, type = 'general' olarak ayarlandı.`);
    
    console.log('✅ Senkronizasyon tamamlandı.');
  } catch (error) {
    console.error('❌ Senkronizasyon hatası:', error);
  } finally {
    process.exit();
  }
};

// Scripti çalıştır
syncAnnouncementModel();
