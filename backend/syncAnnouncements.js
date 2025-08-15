const { sequelize } = require('./models');

async function syncAnnouncements() {
  try {
    console.log('🔄 Duyurular tablosu senkronize ediliyor...');
    
    // Announcements tablosunu senkronize et
    await sequelize.sync({ force: false });
    
    console.log('✅ Duyurular tablosu başarıyla senkronize edildi!');
    
    // PostgreSQL için tablo yapısını kontrol et
    const [results] = await sequelize.query(`
      SELECT 
        column_name as "Field",
        data_type as "Type",
        is_nullable as "Null",
        column_default as "Default"
      FROM information_schema.columns 
      WHERE table_name = 'announcements' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Duyurular tablosu yapısı:');
    results.forEach(row => {
      const nullInfo = row.Null === 'NO' ? '(NOT NULL)' : '';
      const defaultInfo = row.Default ? `(Default: ${row.Default})` : '';
      console.log(`  - ${row.Field}: ${row.Type} ${nullInfo} ${defaultInfo}`);
    });
    
  } catch (error) {
    console.error('❌ Duyurular tablosu senkronize edilirken hata:', error);
  } finally {
    await sequelize.close();
  }
}

// Script çalıştırılırsa
if (require.main === module) {
  syncAnnouncements();
}

module.exports = { syncAnnouncements };
