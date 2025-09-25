const { QueryInterface, DataTypes } = require('sequelize');
const sequelize = require('../db');

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
              await queryInterface.removeConstraint(table, constraintName);
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
        const tableInfo = await queryInterface.describeTable('businesses');
        
        if (tableInfo.business_id) {
          await queryInterface.removeColumn('businesses', 'business_id');
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
          const tableInfo = await queryInterface.describeTable(table);
          
          if (tableInfo.business_id) {
            // Foreign key constraint ekle
            await queryInterface.addConstraint(table, {
              fields: ['business_id'],
              type: 'foreign key',
              name: `fk_${table}_business`,
              references: {
                table: 'businesses',
                field: 'id'
              },
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE'
            });
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
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Business ID yapısı geri alınıyor...');
    
    try {
      // 1. Foreign key constraint'leri kaldır
      const tables = [
        'users', 'branches', 'products', 'categories', 'announcements', 
        'labels', 'sections', 'product_translations', 'category_translations',
        'recommended_products', 'portions', 'ingredients', 'business_translations',
        'role_permissions', 'qrcodes'
      ];

      for (const table of tables) {
        try {
          await queryInterface.removeConstraint(table, `fk_${table}_business`);
          console.log(`✅ ${table} tablosundan foreign key kaldırıldı`);
        } catch (error) {
          console.log(`⚠️ ${table} tablosu için constraint kaldırma hatası: ${error.message}`);
        }
      }

      // 2. businesses tablosuna business_id alanını geri ekle
      try {
        await queryInterface.addColumn('businesses', 'business_id', {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          autoIncrement: true
        });
        console.log('✅ businesses.business_id alanı geri eklendi');
      } catch (error) {
        console.log(`⚠️ business_id alanı ekleme hatası: ${error.message}`);
      }

      console.log('✅ Business ID yapısı geri alındı!');
      
    } catch (error) {
      console.error('❌ Business ID yapısı geri alma hatası:', error);
      throw error;
    }
  }
};
