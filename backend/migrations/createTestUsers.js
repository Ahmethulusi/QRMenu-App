const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sequelize = require('../db');

async function createTestUsers() {
  try {
    console.log('�� Test kullanıcıları oluşturuluyor...');

    const testUsers = [
      {
        name: 'Süper Admin',
        email: 'superadmin@test.com',
        password: '123456',
        role: 'super_admin',
        business_id: 1
      },
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: '123456',
        role: 'admin',
        business_id: 1
      },
      {
        name: 'Manager User',
        email: 'manager@test.com',
        password: '123456',
        role: 'manager',
        business_id: 1,
        branch_id: 1
      }
    ];

    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          password: hashedPassword
        }
      });
    }

    console.log('✅ Test kullanıcıları oluşturuldu!');
    console.log('�� Test kullanıcıları:');
    console.log('- superadmin@test.com (Süper Admin)');
    console.log('- admin@test.com (Admin)');
    console.log('- manager@test.com (Manager)');
    console.log('�� Şifre: 123456');

  } catch (error) {
    console.error('❌ Test kullanıcıları oluşturma hatası:', error);
  } finally {
    await sequelize.close();
  }
}

createTestUsers(); 