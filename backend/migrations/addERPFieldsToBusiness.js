const sequelize = require('../db');

async function addERPFieldsToBusiness() {
  try {
    console.log('🔄 Adding ERP fields to business table...');

    // Business tablosuna ERP alanları ekle
    const queries = [
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS erp_server VARCHAR(100) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS erp_database VARCHAR(50) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS erp_username VARCHAR(50) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS erp_password VARCHAR(200) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS erp_port INTEGER NULL DEFAULT 1433;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS erp_enabled BOOLEAN DEFAULT false;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS last_sync_date TIMESTAMP NULL;`
    ];

    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log('✅ Executed:', query);
      } catch (error) {
        console.log('⚠️ Column might already exist:', query);
      }
    }

    // PostgreSQL için comment'leri ekle
    const commentQueries = [
      `COMMENT ON COLUMN businesses.erp_server IS 'ERP SQL Server sunucu adresi';`,
      `COMMENT ON COLUMN businesses.erp_database IS 'ERP veritabanı adı';`,
      `COMMENT ON COLUMN businesses.erp_username IS 'ERP veritabanı kullanıcı adı';`,
      `COMMENT ON COLUMN businesses.erp_password IS 'ERP veritabanı şifresi';`,
      `COMMENT ON COLUMN businesses.erp_port IS 'ERP SQL Server port numarası';`,
      `COMMENT ON COLUMN businesses.erp_enabled IS 'ERP entegrasyonu aktif mi?';`,
      `COMMENT ON COLUMN businesses.last_sync_date IS 'Son senkronizasyon tarihi';`
    ];

    if (sequelize.getDialect() === 'postgres') {
      for (const query of commentQueries) {
        try {
          await sequelize.query(query);
          console.log('✅ Executed comment:', query);
        } catch (error) {
          console.log('⚠️ Comment error (non-critical):', error.message);
        }
      }
    }

    console.log('✅ ERP fields added to business table successfully!');
  } catch (error) {
    console.error('❌ Error adding ERP fields to business:', error);
    throw error;
  }
}

module.exports = addERPFieldsToBusiness;
