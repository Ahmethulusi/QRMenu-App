require('dotenv').config();
const { up, down } = require('./migrations/alter_table_table_name_to_table_no');

async function runMigration() {
  const action = process.argv[2];
  
  try {
    if (action === 'up') {
      console.log('🔄 Migrasyon başlatılıyor: table_name -> table_no...');
      await up();
      console.log('✅ Migrasyon başarıyla tamamlandı!');
    } else if (action === 'down') {
      console.log('🔄 Geri alma başlatılıyor: table_no -> table_name...');
      await down();
      console.log('✅ Geri alma başarıyla tamamlandı!');
    } else {
      console.log('❌ Geçersiz parametre. Kullanım: node migrate.js [up|down]');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migrasyon hatası:', error);
    process.exit(1);
  }
}

runMigration();
