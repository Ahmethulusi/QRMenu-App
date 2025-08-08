const sequelize = require('./db');
const RolePermission = require('./models/RolePermission');

async function updateDatabase() {
  try {
    console.log('�� Veritabanı güncelleniyor...');

    // Mevcut tabloyu kontrol et
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    const hasRolePermissions = tableExists.includes('role_permissions');

    if (hasRolePermissions) {
      console.log('✅ role_permissions tablosu mevcut');
      
      // is_active kolonunu ekle (eğer yoksa)
      try {
        await sequelize.getQueryInterface().addColumn('role_permissions', 'is_active', {
          type: sequelize.Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        });
        console.log('✅ is_active kolonu eklendi');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('ℹ️ is_active kolonu zaten mevcut');
        } else {
          throw error;
        }
      }

      // Mevcut kayıtları güncelle (is_active = true)
      await RolePermission.update(
        { is_active: true },
        { where: {} }
      );
      console.log('✅ Mevcut kayıtlar güncellendi (is_active = true)');

    } else {
      console.log('❌ role_permissions tablosu bulunamadı');
    }

    console.log('✅ Veritabanı güncelleme tamamlandı!');

  } catch (error) {
    console.error('❌ Veritabanı güncelleme hatası:', error);
  } finally {
    await sequelize.close();
  }
}

// Scripti çalıştır
updateDatabase(); 