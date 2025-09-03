const { sequelize } = require('../models');

const fixDatabaseSchema = async () => {
  try {
    console.log('🔄 Veritabanı şeması düzeltiliyor...');
    
    // 1. businesses tablosuna business_id primary key ekle
    try {
      await sequelize.query(`
        ALTER TABLE businesses 
        ADD COLUMN business_id SERIAL PRIMARY KEY
      `);
      console.log('✅ businesses tablosuna business_id eklendi');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ business_id zaten mevcut');
      } else {
        console.log('⚠️ business_id eklenemedi:', error.message);
      }
    }
    
    // 2. branches tablosuna branch_id primary key ekle
    try {
      await sequelize.query(`
        ALTER TABLE branches 
        ADD COLUMN branch_id SERIAL PRIMARY KEY
      `);
      console.log('✅ branches tablosuna branch_id eklendi');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ branch_id zaten mevcut');
      } else {
        console.log('⚠️ branch_id eklenemedi:', error.message);
      }
    }
    
    // 3. languages tablosuna default_currency_code ekle
    try {
      await sequelize.query(`
        ALTER TABLE languages 
        ADD COLUMN default_currency_code VARCHAR(3) NULL
      `);
      console.log('✅ languages tablosuna default_currency_code eklendi');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ default_currency_code zaten mevcut');
      } else {
        console.log('⚠️ default_currency_code eklenemedi:', error.message);
      }
    }
    
    // 4. products tablosuna currency_code ekle
    try {
      await sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN currency_code VARCHAR(3) NOT NULL DEFAULT 'TRY'
      `);
      console.log('✅ products tablosuna currency_code eklendi');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ currency_code zaten mevcut');
      } else {
        console.log('⚠️ currency_code eklenemedi:', error.message);
      }
    }
    
    // 4. Foreign key constraint'leri ekle
    try {
      // role_permissions -> businesses
      await sequelize.query(`
        ALTER TABLE role_permissions 
        ADD CONSTRAINT fk_role_permissions_business 
        FOREIGN KEY (business_id) REFERENCES businesses(business_id)
      `);
      console.log('✅ role_permissions -> businesses foreign key eklendi');
    } catch (error) {
      console.log('⚠️ role_permissions -> businesses foreign key eklenemedi:', error.message);
    }
    
    try {
      // role_permissions -> branches
      await sequelize.query(`
        ALTER TABLE role_permissions 
        ADD CONSTRAINT fk_role_permissions_branch 
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
      `);
      console.log('✅ role_permissions -> branches foreign key eklendi');
    } catch (error) {
      console.log('⚠️ role_permissions -> branches foreign key eklenemedi:', error.message);
    }
    
    try {
      // branches -> businesses
      await sequelize.query(`
        ALTER TABLE branches 
        ADD CONSTRAINT fk_branches_business 
        FOREIGN KEY (business_id) REFERENCES businesses(business_id)
      `);
      console.log('✅ branches -> businesses foreign key eklendi');
    } catch (error) {
      console.log('⚠️ branches -> businesses foreign key eklenemedi:', error.message);
    }
    
    console.log('✅ Veritabanı şeması düzeltme tamamlandı');
    
  } catch (error) {
    console.error('❌ Veritabanı şeması düzeltme hatası:', error.message);
  }
};

// Eğer bu dosya doğrudan çalıştırılıyorsa
if (require.main === module) {
  fixDatabaseSchema().then(() => {
    console.log('✅ İşlem tamamlandı');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ İşlem başarısız:', error);
    process.exit(1);
  });
}

module.exports = { fixDatabaseSchema };
