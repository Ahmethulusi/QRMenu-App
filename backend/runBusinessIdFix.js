const sequelize = require('./db');

async function fixBusinessIdStructure() {
  console.log('🔄 Business ID yapısı düzeltiliyor...');

  try {
    // 1. Önce tüm foreign key constraint'leri kaldır
    console.log('📋 Foreign key constraint\'leri kaldırılıyor...');
    
    const tables = [
      'users', 'branches', 'products', 'categories', 'announcements', 
      'labels', 'sections', 'product_translations', 'category_translations',
      'recommended_products', 'portions', 'ingredients', 'business_translations',
      'role_permissions', 'qrcodes'
    ];

    for (const table of tables) {
      try {
        // Constraint isimlerini tahmin et ve kaldır
        const constraintNames = [
          `fk_${table}_business`,
          `fk_${table}_business_id`,
          `${table}_business_id_fkey`,
          `FK_${table.toUpperCase()}_BUSINESS_ID`
        ];

        for (const constraintName of constraintNames) {
          try {
            await sequelize.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${constraintName};`);
            console.log(`✅ ${table} tablosundan ${constraintName} constraint kaldırıldı`);
          } catch (error) {
            // Constraint yoksa devam et
            if (!error.message.includes('does not exist')) {
              console.log(`⚠️ ${constraintName} constraint kaldırılamadı: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ ${table} tablosu için constraint kaldırma hatası: ${error.message}`);
      }
    }

    // 2. businesses tablosundaki gereksiz business_id alanını kaldır
    console.log('🗑️ businesses tablosundaki gereksiz business_id alanı kaldırılıyor...');
    
    try {
      // Önce business_id alanının var olup olmadığını kontrol et
      const tableInfo = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'businesses' AND column_name = 'business_id';
      `);
      
      if (tableInfo[0].length > 0) {
        await sequelize.query(`ALTER TABLE businesses DROP COLUMN IF EXISTS business_id;`);
        console.log('✅ businesses.business_id alanı kaldırıldı');
      } else {
        console.log('ℹ️ businesses.business_id alanı zaten yok');
      }
    } catch (error) {
      console.log(`⚠️ business_id alanı kaldırma hatası: ${error.message}`);
    }

    // 3. Tüm tablolarda business_id foreign key'lerini id'ye yönlendir
    console.log('🔗 Foreign key\'ler düzeltiliyor...');
    
    for (const table of tables) {
      try {
        // business_id alanının var olup olmadığını kontrol et
        const tableInfo = await sequelize.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${table}' AND column_name = 'business_id';
        `);
        
        if (tableInfo[0].length > 0) {
          // Foreign key constraint ekle
          await sequelize.query(`
            ALTER TABLE ${table} 
            ADD CONSTRAINT fk_${table}_business 
            FOREIGN KEY (business_id) REFERENCES businesses(id) 
            ON DELETE CASCADE ON UPDATE CASCADE;
          `);
          console.log(`✅ ${table}.business_id → businesses.id foreign key eklendi`);
        }
      } catch (error) {
        console.log(`⚠️ ${table} tablosu için foreign key ekleme hatası: ${error.message}`);
      }
    }

    console.log('✅ Business ID yapısı başarıyla düzeltildi!');
    
  } catch (error) {
    console.error('❌ Business ID yapısı düzeltme hatası:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Script'i çalıştır
fixBusinessIdStructure()
  .then(() => {
    console.log('🎉 Migration tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration hatası:', error);
    process.exit(1);
  });
