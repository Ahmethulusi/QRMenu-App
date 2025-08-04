const sequelize = require('./db');
const User = require('./models/User');

async function syncUserTable() {
  try {
    console.log('🔄 User tablosu senkronizasyonu başlatılıyor...');
    
    // Sadece User tablosunu senkronize et
    await User.sync({ alter: true });
    
    console.log('✅ User tablosu başarıyla senkronize edildi!');
    
    // Mevcut kullanıcıları kontrol et ve role alanını güncelle
    const users = await User.findAll();
    console.log(`📊 Toplam ${users.length} kullanıcı bulundu`);
    
    for (const user of users) {
      if (!user.role) {
        // Varsayılan olarak manager rolü ata
        await user.update({ role: 'manager' });
        console.log(`👤 ${user.name} kullanıcısına 'manager' rolü atandı`);
      }
    }
    
    console.log('✅ Tüm kullanıcılar güncellendi!');
    
  } catch (error) {
    console.error('❌ User tablosu senkronizasyon hatası:', error);
  } finally {
    await sequelize.close();
  }
}

// Scripti çalıştır
syncUserTable(); 