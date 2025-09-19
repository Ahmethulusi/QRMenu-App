const sequelize = require('../db');

async function updateBusinessProfileFields() {
  try {
    console.log('🔄 Starting Business table new fields migration...');

    // Add new columns to businesses table
    const queries = [
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS about_text TEXT NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS slogan VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS opening_hours JSON NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS welcome_background VARCHAR(255) NULL;`
    ];

    // PostgreSQL için comment'leri ayrı ayrı ekle
    const commentQueries = [
      `COMMENT ON COLUMN businesses.about_text IS 'About us text/description';`,
      `COMMENT ON COLUMN businesses.slogan IS 'Business slogan';`,
      `COMMENT ON COLUMN businesses.opening_hours IS 'Opening hours for each day of the week';`,
      `COMMENT ON COLUMN businesses.welcome_background IS 'Welcome screen background image path';`
    ];

    // Execute column additions
    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log('✅ Executed:', query);
      } catch (error) {
        console.log('⚠️ Column might already exist:', query);
      }
    }

    // Execute comments (only for PostgreSQL)
    if (sequelize.getDialect() === 'postgres') {
      for (const query of commentQueries) {
        try {
          await sequelize.query(query);
          console.log('✅ Executed:', query);
        } catch (error) {
          console.log('⚠️ Comment error (non-critical):', error.message);
        }
      }
    }

    console.log('✅ Business table new fields migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during Business table new fields migration:', error);
    throw error;
  }
}

// Export as a function that can be called
module.exports = updateBusinessProfileFields;

// If this file is run directly
if (require.main === module) {
  updateBusinessProfileFields()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
