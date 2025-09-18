const sequelize = require('../db');

async function updateBusinessProfile() {
  try {
    console.log('🔄 Starting Business table profile update migration...');

    // Add new columns to businesses table
    const queries = [
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS banner_images JSON NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS website_url VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS phone VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address TEXT NULL;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;`,
      `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;`
    ];

    // PostgreSQL için comment'leri ayrı ayrı ekle
    const commentQueries = [
      `COMMENT ON COLUMN businesses.logo IS 'Logo image path';`,
      `COMMENT ON COLUMN businesses.banner_images IS 'Array of banner image paths for carousel';`,
      `COMMENT ON COLUMN businesses.custom_domain IS 'Custom domain for the QR menu';`,
      `COMMENT ON COLUMN businesses.website_url IS 'Business website URL';`,
      `COMMENT ON COLUMN businesses.instagram_url IS 'Instagram profile URL';`,
      `COMMENT ON COLUMN businesses.facebook_url IS 'Facebook page URL';`,
      `COMMENT ON COLUMN businesses.twitter_url IS 'Twitter/X profile URL';`,
      `COMMENT ON COLUMN businesses.linkedin_url IS 'LinkedIn profile URL';`,
      `COMMENT ON COLUMN businesses.youtube_url IS 'YouTube channel URL';`,
      `COMMENT ON COLUMN businesses.phone IS 'Business phone number';`,
      `COMMENT ON COLUMN businesses.email IS 'Business email address';`,
      `COMMENT ON COLUMN businesses.address IS 'Business address';`
    ];

    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log(`✅ Executed: ${query.split(' ').slice(0, 6).join(' ')}...`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('Duplicate column name')) {
          console.log(`⚠️  Column already exists: ${query.split(' ').slice(5, 6).join('')}`);
        } else {
          console.error(`❌ Error executing query: ${query}`);
          throw error;
        }
      }
    }

    // Şimdi comment'leri ekle
    for (const commentQuery of commentQueries) {
      try {
        await sequelize.query(commentQuery);
        console.log(`✅ Comment added: ${commentQuery.split(' ').slice(3, 4).join('')}`);
      } catch (error) {
        console.log(`⚠️  Comment could not be added: ${error.message}`);
        // Comment hatası kritik değil, devam et
      }
    }

    // Update existing records to have timestamps if they don't
    await sequelize.query(`
      UPDATE businesses 
      SET created_at = COALESCE(created_at, NOW()),
          updated_at = COALESCE(updated_at, NOW())
      WHERE created_at IS NULL OR updated_at IS NULL;
    `);

    console.log('✅ Business profile migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during Business profile migration:', error);
    throw error;
  }
}

module.exports = updateBusinessProfile;

// Run migration if called directly
if (require.main === module) {
  updateBusinessProfile()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}
