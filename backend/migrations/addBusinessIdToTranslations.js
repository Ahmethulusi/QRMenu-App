const sequelize = require('../db');

async function addBusinessIdToTranslations() {
  try {
    console.log('🔄 Adding business_id to translation tables...');

    // Product translations tablosuna business_id kolonu ekle
    await sequelize.query(`
      ALTER TABLE product_translations 
      ADD COLUMN IF NOT EXISTS business_id INTEGER NOT NULL DEFAULT 1
    `);

    // Category translations tablosuna business_id kolonu ekle
    await sequelize.query(`
      ALTER TABLE category_translations 
      ADD COLUMN IF NOT EXISTS business_id INTEGER NOT NULL DEFAULT 1
    `);

    // Foreign key constraints ekle
    await sequelize.query(`
      ALTER TABLE product_translations 
      ADD CONSTRAINT fk_product_translations_business 
        FOREIGN KEY (business_id) 
        REFERENCES businesses(id) 
        ON DELETE CASCADE
    `);

    await sequelize.query(`
      ALTER TABLE category_translations 
      ADD CONSTRAINT fk_category_translations_business 
        FOREIGN KEY (business_id) 
        REFERENCES businesses(id) 
        ON DELETE CASCADE
    `);

    // Indexes ekle
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_product_translations_business_id 
      ON product_translations(business_id)
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_category_translations_business_id 
      ON category_translations(business_id)
    `);

    console.log('✅ business_id added to translation tables successfully!');
  } catch (error) {
    console.error('❌ Error adding business_id to translations:', error);
    throw error;
  }
}

module.exports = addBusinessIdToTranslations;
