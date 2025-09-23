const sequelize = require('../db');

async function addBusinessIdToOtherModels() {
  try {
    console.log('🔄 Adding business_id to other models...');

    // Recommended products tablosuna business_id kolonu ekle
    await sequelize.query(`
      ALTER TABLE recommended_products 
      ADD COLUMN IF NOT EXISTS business_id INTEGER NOT NULL DEFAULT 1
    `);

    // Portions tablosuna business_id kolonu ekle
    await sequelize.query(`
      ALTER TABLE portions 
      ADD COLUMN IF NOT EXISTS business_id INTEGER NOT NULL DEFAULT 1
    `);

    // Ingredients tablosuna business_id kolonu ekle
    await sequelize.query(`
      ALTER TABLE ingredients 
      ADD COLUMN IF NOT EXISTS business_id INTEGER NOT NULL DEFAULT 1
    `);

    // Foreign key constraints ekle
    await sequelize.query(`
      ALTER TABLE recommended_products 
      ADD CONSTRAINT fk_recommended_products_business 
        FOREIGN KEY (business_id) 
        REFERENCES businesses(id) 
        ON DELETE CASCADE
    `);

    await sequelize.query(`
      ALTER TABLE portions 
      ADD CONSTRAINT fk_portions_business 
        FOREIGN KEY (business_id) 
        REFERENCES businesses(id) 
        ON DELETE CASCADE
    `);

    await sequelize.query(`
      ALTER TABLE ingredients 
      ADD CONSTRAINT fk_ingredients_business 
        FOREIGN KEY (business_id) 
        REFERENCES businesses(id) 
        ON DELETE CASCADE
    `);

    // Indexes ekle
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_recommended_products_business_id 
      ON recommended_products(business_id)
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_portions_business_id 
      ON portions(business_id)
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_business_id 
      ON ingredients(business_id)
    `);

    console.log('✅ business_id added to other models successfully!');
  } catch (error) {
    console.error('❌ Error adding business_id to other models:', error);
    throw error;
  }
}

module.exports = addBusinessIdToOtherModels;
