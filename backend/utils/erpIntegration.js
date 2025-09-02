const sql = require('mssql');
const { Products, Category } = require('../models');

class ERPIntegration {
  constructor(userConfig) {
    this.userConfig = userConfig;
    
    // Ortama göre SSL ayarları
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalNetwork = userConfig.erp_server.includes('192.168.') || 
                         userConfig.erp_server.includes('10.') || 
                         userConfig.erp_server.includes('172.') ||
                         userConfig.erp_server === 'localhost' ||
                         userConfig.erp_server === '127.0.0.1';

    this.sqlConfig = {
      server: userConfig.erp_server,
      database: userConfig.erp_database,
      user: userConfig.erp_username,
      password: userConfig.erp_password,
      port: userConfig.erp_port || 1433,
      options: {
        encrypt: false, // Her ortamda SSL'i kapat (güvenlik için)
        trustServerCertificate: true, // Her ortamda sertifika güvenini aç
        enableArithAbort: true,
        // SSL ayarları - Her ortamda esnek
        ssl: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.0' // Daha eski TLS versiyonlarını da destekle
        }
      }
    };
  }

  // SQL Server bağlantısını test et
  async testConnection() {
    try {
      const pool = await sql.connect(this.sqlConfig);
      await pool.close();
      return { success: true, message: 'Bağlantı başarılı' };
    } catch (error) {
      return { success: false, message: `Bağlantı hatası: ${error.message}` };
    }
  }

  // Stok grupları (kategoriler) senkronizasyonu
  async syncCategories() {
    try {
      const pool = await sql.connect(this.sqlConfig);
      
      // ERP'den stok gruplarını çek (sadece QR yayınlananlar)
      // STOK_GRUP tablosunda ID ve USTID var, KOD yok
      const categoriesResult = await pool.request()
        .query(`
          SELECT 
            ID as category_id,
            AD as category_name,
            USTID as parent_id,
            QR_MENU_SIRA as sira_id
          FROM STOK_GRUP 
          WHERE AKTIF = 1 AND QRYAYINLANIR = 1
          ORDER BY QR_MENU_SIRA
        `);

      const categories = categoriesResult.recordset;
      await pool.close();

      // PostgreSQL'e senkronize et
      const syncedCategories = [];
      for (const category of categories) {
        let parentCategoryId = null;
        
        // Üst kategori varsa bul
        if (category.parent_id) {
          const parentCategory = await Category.findOne({
            where: { category_code: category.parent_id.toString() }
          });
          if (parentCategory) {
            parentCategoryId = parentCategory.category_id;
          }
        }

        // Kategoriyi oluştur veya güncelle
        const [syncedCategory, created] = await Category.findOrCreate({
          where: { category_code: category.category_id.toString() },
          defaults: {
            category_name: category.category_name,
            sira_id: category.sira_id,
            parent_id: parentCategoryId,
            business_id: this.userConfig.business_id
          }
        });

        if (!created) {
          // Mevcut kategoriyi güncelle
          await syncedCategory.update({
            category_name: category.category_name,
            sira_id: category.sira_id,
            parent_id: parentCategoryId
          });
        }

        syncedCategories.push(syncedCategory);
      }

      return {
        success: true,
        message: `${syncedCategories.length} kategori senkronize edildi`,
        data: syncedCategories
      };

    } catch (error) {
      return {
        success: false,
        message: `Kategori senkronizasyon hatası: ${error.message}`
      };
    }
  }

  // Stok (ürünler) senkronizasyonu
  async syncProducts() {
    try {
      const pool = await sql.connect(this.sqlConfig);
      
      // ERP'den stok bilgilerini çek (sadece QR yayınlananlar)
      // ERP'den stok bilgilerini çek (sadece QR yayınlananlar)
      // Fiyat bilgisi için 3 tablo birleştirmek gerekiyor:
      // STOK -> STOK_STOK_BIRIM -> STOK_STOK_BIRIM_FIYAT
      console.log('🔍 3 tablo birleştirme ile fiyat bilgisi alınıyor...');
      
      const productsResult = await pool.request()
        .query(`
          SELECT 
            s.ID as product_id,
            s.KOD as product_code,
            s.AD as product_name,
            s.STOK_GRUP as category_id,
            COALESCE(sbf.FIYAT, 0) as price,
            s.KALORI as calorie_count,
            s.PISIRME_SURESI as cooking_time,
            s.SIRA as sira_id
          FROM STOK s
          INNER JOIN STOK_GRUP sg ON s.STOK_GRUP = sg.ID
          LEFT JOIN STOK_STOK_BIRIM ssb ON s.ID = ssb.STOK
          LEFT JOIN STOK_STOK_BIRIM_FIYAT sbf ON ssb.ID = sbf.STOK_STOK_BIRIM
          WHERE s.AKTIF = 1 AND sg.AKTIF = 1 
            AND s.QRYAYINLANIR = 1 AND sg.QRYAYINLANIR = 1
          ORDER BY s.SIRA
        `);

      const products = productsResult.recordset;
      await pool.close();

      // PostgreSQL'e senkronize et
      const syncedProducts = [];
      for (const product of products) {
        // Kategori ID'sini bul
        const category = await Category.findOne({
          where: { category_code: product.category_id.toString() }
        });

        if (!category) {
          console.warn(`Kategori bulunamadı: ${product.category_id}`);
          continue;
        }

        // Ürünü oluştur veya güncelle
        const [syncedProduct, created] = await Products.findOrCreate({
          where: { product_code: product.product_code },
          defaults: {
            product_name: product.product_name,
            price: product.price || 0,
            category_id: category.category_id,
            business_id: this.userConfig.business_id,
            calorie_count: product.calorie_count,
            cooking_time: product.cooking_time,
            sira_id: product.sira_id,
            is_available: true,
            is_selected: false
          }
        });

        if (!created) {
          // Mevcut ürünü güncelle
          await syncedProduct.update({
            product_name: product.product_name,
            price: product.price || 0,
            category_id: category.category_id,
            calorie_count: product.calorie_count,
            cooking_time: product.cooking_time,
            sira_id: product.sira_id
          });
        }

        syncedProducts.push(syncedProduct);
      }

      return {
        success: true,
        message: `${syncedProducts.length} ürün senkronize edildi`,
        data: syncedProducts
      };

    } catch (error) {
      return {
        success: false,
        message: `Ürün senkronizasyon hatası: ${error.message}`
      };
    }
  }

  // Tam senkronizasyon (kategoriler + ürünler)
  async fullSync() {
    try {
      console.log('🔄 Tam senkronizasyon başlatılıyor...');
      
      // Önce kategorileri senkronize et
      const categoriesResult = await this.syncCategories();
      if (!categoriesResult.success) {
        return categoriesResult;
      }
      
      // Sonra ürünleri senkronize et
      const productsResult = await this.syncProducts();
      if (!productsResult.success) {
        return productsResult;
      }
      
      // Son senkronizasyon tarihini güncelle
      const User = require('../models/User');
      await User.update(
        { last_sync_date: new Date() },
        { where: { id: this.userConfig.user_id } }
      );
      
      return {
        success: true,
        message: `Tam senkronizasyon tamamlandı! ${categoriesResult.data.length} kategori, ${productsResult.data.length} ürün`,
        data: {
          categories: categoriesResult.data,
          products: productsResult.data
        }
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Tam senkronizasyon hatası: ${error.message}`
      };
    }
  }

  // Stok durumu güncelleme
  async updateStockLevels() {
    try {
      const pool = await sql.connect(this.sqlConfig);
      
      const stockResult = await pool.request()
        .query(`
          SELECT 
            s.KOD as product_code,
            sbf.FIYAT as price
          FROM STOK s
          LEFT JOIN STOK_STOK_BIRIM ssb ON s.ID = ssb.STOK
          LEFT JOIN STOK_STOK_BIRIM_FIYAT sbf ON ssb.ID = sbf.STOK_STOK_BIRIM
          WHERE s.AKTIF = 1 AND s.QRYAYINLANIR = 1
        `);

      const stockData = stockResult.recordset;
      await pool.close();

      let updatedCount = 0;
      for (const stock of stockData) {
        const product = await Products.findOne({
          where: { product_code: stock.product_code }
        });

        if (product) {
          await product.update({
            price: stock.price || 0
          });
          updatedCount++;
        }
      }

      return {
        success: true,
        message: `${updatedCount} ürünün fiyat bilgisi güncellendi`
      };

    } catch (error) {
      return {
        success: false,
        message: `Stok güncelleme hatası: ${error.message}`
      };
    }
  }
}

module.exports = ERPIntegration;
