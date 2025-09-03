const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const User = require('../models/User');
const { checkPermission } = require('../middleware/authMiddleware');
const sequelize = require('../db');

async function testPermissions() {
  try {
    console.log('�� Yetki sistemi test ediliyor...');

    // Test kullanıcıları oluştur
    const testUsers = [
      { role: 'super_admin', business_id: 1 },
      { role: 'admin', business_id: 1 },
      { role: 'manager', business_id: 1, branch_id: 1 }
    ];

    for (const testUser of testUsers) {
      console.log(`\n👤 ${testUser.role} rolü test ediliyor:`);
      
      // Farklı yetkileri test et
      const testPermissions = [
        { resource: 'products', action: 'read' },
        { resource: 'products', action: 'create' },
        { resource: 'categories', action: 'delete' },
        { resource: 'users', action: 'update' },
        { resource: 'tables', action: 'create' }
      ];

      for (const perm of testPermissions) {
        const hasPermission = await checkPermission(perm.resource, perm.action)({
          user: testUser
        }, {
          status: () => ({ json: (data) => console.log(`  ${perm.resource}:${perm.action} - ${data.hasPermission}`) })
        }, () => console.log(`  ${perm.resource}:${perm.action} - ✅ İzin verildi`));
      }
    }

    console.log('\n✅ Yetki sistemi testi tamamlandı!');
  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    await sequelize.close();
  }
}

// Test fonksiyonunu çalıştır
if (require.main === module) {
  testPermissions();
}

module.exports = { testPermissions };