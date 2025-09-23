const sequelize = require('../db');

async function addBusinessIdToLabels() {
  try {
    console.log('🔄 Adding business_id to labels table...');

    // Labels tablosuna business_id kolonu ekle
    await sequelize.query(`
      ALTER TABLE labels 
      ADD COLUMN IF NOT EXISTS business_id INTEGER NOT NULL DEFAULT 1
    `);

    // Foreign key constraint ekle (eğer yoksa)
    try {
      await sequelize.query(`
        ALTER TABLE labels 
        ADD CONSTRAINT fk_labels_business 
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
      CREATE INDEX IF NOT EXISTS idx_labels_business_id 
      ON labels(business_id)
    `);

    console.log('✅ business_id added to labels table successfully!');
  } catch (error) {
    console.error('❌ Error adding business_id to labels:', error);
    throw error;
  }
}

module.exports = addBusinessIdToLabels;
