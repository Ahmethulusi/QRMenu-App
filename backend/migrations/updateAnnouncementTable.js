const sequelize = require('../db');

/**
 * Bu script, Announcement tablosunu SQL komutları ile günceller.
 * Yeni alanları ekler ve gerekli dönüşümleri yapar.
 */
const updateAnnouncementTable = async () => {
  try {
    console.log('🔄 Announcement tablosu güncelleniyor...');
    
    // Bağlantıyı test et
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı başarılı.');
    
    // Mevcut tabloyu kontrol et
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'announcements'
    `);
    
    const columnNames = columns.map(col => col.column_name);
    console.log('📊 Mevcut sütunlar:', columnNames);
    
    // Yeni alanları ekle
    const alterCommands = [];
    
    // type alanı
    if (!columnNames.includes('type')) {
      alterCommands.push(`
        ALTER TABLE announcements 
        ADD COLUMN type VARCHAR(20) DEFAULT 'general'
      `);
    }
    
    // discount_type alanı
    if (!columnNames.includes('discount_type')) {
      alterCommands.push(`
        ALTER TABLE announcements 
        ADD COLUMN discount_type VARCHAR(20)
      `);
    }
    
    // discount_value alanı
    if (!columnNames.includes('discount_value')) {
      alterCommands.push(`
        ALTER TABLE announcements 
        ADD COLUMN discount_value DECIMAL(10,2)
      `);
    }
    
    // applicable_products alanı
    if (!columnNames.includes('applicable_products')) {
      alterCommands.push(`
        ALTER TABLE announcements 
        ADD COLUMN applicable_products JSONB
      `);
    }
    
    // applicable_categories alanı
    if (!columnNames.includes('applicable_categories')) {
      alterCommands.push(`
        ALTER TABLE announcements 
        ADD COLUMN applicable_categories JSONB
      `);
    }
    
    // campaign_condition alanı
    if (!columnNames.includes('campaign_condition')) {
      alterCommands.push(`
        ALTER TABLE announcements 
        ADD COLUMN campaign_condition VARCHAR(500)
      `);
    }
    
    // campaign_reward alanı
    if (!columnNames.includes('campaign_reward')) {
      alterCommands.push(`
        ALTER TABLE announcements 
        ADD COLUMN campaign_reward VARCHAR(500)
      `);
    }
    
    // Komutları çalıştır
    for (const command of alterCommands) {
      console.log('🔧 SQL komutu çalıştırılıyor:', command);
      await sequelize.query(command);
      console.log('✅ Komut başarıyla çalıştırıldı.');
    }
    
    // Mevcut kayıtları güncelle
    if (columnNames.includes('type')) {
      const [updateCount] = await sequelize.query(`
        UPDATE announcements 
        SET type = 'general' 
        WHERE type IS NULL
      `);
      console.log(`🔄 ${updateCount} kayıt güncellendi, type = 'general' olarak ayarlandı.`);
    }
    
    console.log('✅ Tablo güncelleme işlemi tamamlandı.');
  } catch (error) {
    console.error('❌ Tablo güncelleme hatası:', error);
  } finally {
    process.exit();
  }
};

// Scripti çalıştır
updateAnnouncementTable();
