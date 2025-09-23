const addBusinessIdToAnnouncements = require('./addBusinessIdToAnnouncements');
const addERPFieldsToBusiness = require('./addERPFieldsToBusiness');
const removeERPFieldsFromUsers = require('./removeERPFieldsFromUsers');
const addBusinessIdToLabels = require('./addBusinessIdToLabels');
const addBusinessIdToSections = require('./addBusinessIdToSections');
const addBusinessIdToTranslations = require('./addBusinessIdToTranslations');
const addBusinessIdToOtherModels = require('./addBusinessIdToOtherModels');

async function runMultiTenantMigration() {
  try {
    console.log('🚀 Starting Multi-Tenant Migration...');
    console.log('=====================================');

    // 1. Announcements tablosuna business_id ekle
    console.log('\n📢 Step 1: Adding business_id to announcements...');
    await addBusinessIdToAnnouncements();

    // 2. Business tablosuna ERP alanları ekle
    console.log('\n🏢 Step 2: Adding ERP fields to business...');
    await addERPFieldsToBusiness();

    // 3. Users tablosundan ERP alanlarını kaldır
    console.log('\n👤 Step 3: Removing ERP fields from users...');
    await removeERPFieldsFromUsers();

    // 4. Products ve Categories zaten business_id'ye sahip - atla
    console.log('\n🛍️ Step 4: Products ve Categories zaten business_id\'ye sahip - atlanıyor...');

    // 5. Labels tablosuna business_id ekle
    console.log('\n🏷️ Step 5: Adding business_id to labels...');
    await addBusinessIdToLabels();

    // 6. Sections tablosuna business_id ekle
    console.log('\n📁 Step 6: Adding business_id to sections...');
    await addBusinessIdToSections();

    // 7. Translation tablolarına business_id ekle
    console.log('\n🌐 Step 7: Adding business_id to translations...');
    await addBusinessIdToTranslations();

    // 8. Diğer modellere business_id ekle
    console.log('\n🔧 Step 8: Adding business_id to other models...');
    await addBusinessIdToOtherModels();

    console.log('\n✅ Multi-Tenant Migration completed successfully!');
    console.log('=====================================');
    console.log('📋 Summary:');
    console.log('  - ✅ business_id added to announcements');
    console.log('  - ✅ Products ve Categories zaten business_id\'ye sahipti');
    console.log('  - ✅ business_id added to labels');
    console.log('  - ✅ business_id added to sections');
    console.log('  - ✅ business_id added to translations');
    console.log('  - ✅ business_id added to other models');
    console.log('  - ✅ ERP fields moved from users to business');
    console.log('  - ✅ Foreign key constraints added');
    console.log('  - ✅ Indexes created for performance');
    
  } catch (error) {
    console.error('❌ Multi-Tenant Migration failed:', error);
    throw error;
  }
}

// Eğer direkt çalıştırılıyorsa
if (require.main === module) {
  runMultiTenantMigration()
    .then(() => {
      console.log('🎉 Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = runMultiTenantMigration;
