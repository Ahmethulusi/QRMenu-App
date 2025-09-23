const sequelize = require('../db');

async function addBusinessIdToSections() {
  try {
    console.log('🔄 Adding business_id to sections table...');

    // Sections tablosuna business_id kolonu ekle
    await sequelize.query(`
      ALTER TABLE sections 
      ADD COLUMN IF NOT EXISTS business_id INTEGER NOT NULL DEFAULT 1
    `);

    // Foreign key constraint ekle
    await sequelize.query(`
      ALTER TABLE sections 
      ADD CONSTRAINT fk_sections_business 
        FOREIGN KEY (business_id) 
        REFERENCES businesses(id) 
        ON DELETE CASCADE
    `);

    // Index ekle
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_sections_business_id 
      ON sections(business_id)
    `);

    console.log('✅ business_id added to sections table successfully!');
  } catch (error) {
    console.error('❌ Error adding business_id to sections:', error);
    throw error;
  }
}

module.exports = addBusinessIdToSections;
