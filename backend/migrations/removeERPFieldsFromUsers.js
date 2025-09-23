const sequelize = require('../db');

async function removeERPFieldsFromUsers() {
  try {
    console.log('🔄 Removing ERP fields from users table...');

    // Users tablosundan ERP alanlarını kaldır
    const queries = [
      `ALTER TABLE users DROP COLUMN IF EXISTS erp_server;`,
      `ALTER TABLE users DROP COLUMN IF EXISTS erp_database;`,
      `ALTER TABLE users DROP COLUMN IF EXISTS erp_username;`,
      `ALTER TABLE users DROP COLUMN IF EXISTS erp_password;`,
      `ALTER TABLE users DROP COLUMN IF EXISTS erp_port;`,
      `ALTER TABLE users DROP COLUMN IF EXISTS erp_enabled;`,
      `ALTER TABLE users DROP COLUMN IF EXISTS last_sync_date;`
    ];

    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log('✅ Executed:', query);
      } catch (error) {
        console.log('⚠️ Column might not exist:', query);
      }
    }

    console.log('✅ ERP fields removed from users table successfully!');
  } catch (error) {
    console.error('❌ Error removing ERP fields from users:', error);
    throw error;
  }
}

module.exports = removeERPFieldsFromUsers;
