const sequelize = require('../db');

async function addBusinessIdToAnnouncements() {
  try {
    console.log('🔄 Adding business_id to announcements table...');

    // Önce business_id kolonu ekle (foreign key olmadan)
    await sequelize.query(`
      ALTER TABLE announcements 
      ADD COLUMN IF NOT EXISTS business_id INTEGER NOT NULL DEFAULT 1
    `);

    // Sonra foreign key constraint ekle (eğer yoksa)
    try {
      await sequelize.query(`
        ALTER TABLE announcements 
        ADD CONSTRAINT fk_announcements_business 
          FOREIGN KEY (business_id) 
          REFERENCES businesses(id) 
          ON DELETE CASCADE
      `);
      console.log('✅ Foreign key constraint added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ Foreign key constraint already exists - skipping');
      } else {
        throw error;
      }
    }

    // Index ekle
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_announcements_business_id 
      ON announcements(business_id)
    `);

    console.log('✅ business_id added to announcements table successfully!');
  } catch (error) {
    console.error('❌ Error adding business_id to announcements:', error);
    throw error;
  }
}

module.exports = addBusinessIdToAnnouncements;
