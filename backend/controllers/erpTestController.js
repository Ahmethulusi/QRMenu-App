const sql = require('mssql');
const { User } = require('../models');

class ERPTestController {
  // Test için ERP bağlantı bilgilerini al
  async getTestConfig(req, res) {
    try {
      const { user_id } = req.user;
      
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }

      res.json({
        success: true,
        data: {
          erp_server: user.erp_server || '',
          erp_database: user.erp_database || '',
          erp_username: user.erp_username || '',
          erp_port: user.erp_port || 1433,
          erp_enabled: user.erp_enabled || false
        }
      });

    } catch (error) {
      console.error('Test config hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Test konfigürasyonu alınırken hata oluştu'
      });
    }
  }

  // Test için ERP bağlantı bilgilerini güncelle
  async updateTestConfig(req, res) {
    try {
      const { user_id } = req.user;
      const { 
        erp_server, 
        erp_database, 
        erp_username, 
        erp_password, 
        erp_port 
      } = req.body;

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }

      await user.update({
        erp_server,
        erp_database,
        erp_username,
        erp_password,
        erp_port: erp_port || 1433,
        erp_enabled: true
      });

      res.json({
        success: true,
        message: 'Test konfigürasyonu güncellendi',
        data: {
          erp_server: user.erp_server,
          erp_database: user.erp_database,
          erp_username: user.erp_username,
          erp_port: user.erp_port,
          erp_enabled: user.erp_enabled
        }
      });

    } catch (error) {
      console.error('Test config güncelleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Test konfigürasyonu güncellenirken hata oluştu'
      });
    }
  }

  // Test bağlantısı
  async testConnection(req, res) {
    try {
      const { user_id } = req.user;
      
      const user = await User.findByPk(user_id);
      if (!user || !user.erp_server) {
        return res.status(400).json({
          success: false,
          message: 'ERP konfigürasyonu eksik'
        });
      }

      // Ortama göre SSL ayarları
      const isProduction = process.env.NODE_ENV === 'production';
      const isLocalNetwork = user.erp_server.includes('192.168.') || 
                           user.erp_server.includes('10.') || 
                           user.erp_server.includes('172.') ||
                           user.erp_server === 'localhost' ||
                           user.erp_server === '127.0.0.1';

      console.log('🔍 Ortam Bilgileri:', {
        NODE_ENV: process.env.NODE_ENV,
        isProduction,
        isLocalNetwork,
        server: user.erp_server
      });

      // Test için özel SSL ayarları
      const sqlConfig = {
        server: user.erp_server,
        database: user.erp_database,
        user: user.erp_username,
        password: user.erp_password,
        port: user.erp_port || 1433,
        options: {
          encrypt: isProduction && !isLocalNetwork, // Canlı ortamda SSL, local'de kapalı
          trustServerCertificate: !isProduction || isLocalNetwork, // Local'de güven
          enableArithAbort: true,
          connectTimeout: 30000,
          requestTimeout: 30000,
          // SSL ayarları
          ssl: isProduction && !isLocalNetwork ? {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
          } : false
        }
      };

      console.log('🔄 Test bağlantısı deneniyor:', {
        server: sqlConfig.server,
        database: sqlConfig.database,
        user: sqlConfig.user,
        port: sqlConfig.port,
        ssl: sqlConfig.options.ssl,
        encrypt: sqlConfig.options.encrypt,
        trustServerCertificate: sqlConfig.options.trustServerCertificate
      });

      const pool = await sql.connect(sqlConfig);
      await pool.close();

      res.json({
        success: true,
        message: '✅ Test bağlantısı başarılı!',
        data: {
          server: sqlConfig.server,
          database: sqlConfig.database,
          port: sqlConfig.port,
          sslEnabled: sqlConfig.options.encrypt,
          environment: process.env.NODE_ENV || 'development'
        }
      });

    } catch (error) {
      console.error('❌ Test bağlantı hatası:', error);
      res.status(500).json({
        success: false,
        message: `Test bağlantısı başarısız: ${error.message}`,
        error: error.message
      });
    }
  }

  // Test sorguları
  async testQueries(req, res) {
    try {
      const { user_id } = req.user;
      
      const user = await User.findByPk(user_id);
      if (!user || !user.erp_server) {
        return res.status(400).json({
          success: false,
          message: 'ERP konfigürasyonu eksik'
        });
      }

      // Ortama göre SSL ayarları
      const isProduction = process.env.NODE_ENV === 'production';
      const isLocalNetwork = user.erp_server.includes('192.168.') || 
                           user.erp_server.includes('10.') || 
                           user.erp_server.includes('172.') ||
                           user.erp_server === 'localhost' ||
                           user.erp_server === '127.0.0.1';

      const sqlConfig = {
        server: user.erp_server,
        database: user.erp_database,
        user: user.erp_username,
        password: user.erp_password,
        port: user.erp_port || 1433,
        options: {
          encrypt: isProduction && !isLocalNetwork, // Canlı ortamda SSL, local'de kapalı
          trustServerCertificate: !isProduction || isLocalNetwork, // Local'de güven
          enableArithAbort: true,
          // SSL ayarları
          ssl: isProduction && !isLocalNetwork ? {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
          } : false
        }
      };

      const pool = await sql.connect(sqlConfig);
      const results = {};

      try {
        // 1. Veritabanı listesi
        try {
          const databasesResult = await pool.request().query(`
            SELECT name FROM sys.databases 
            WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb') 
            ORDER BY name
          `);
          results.databases = databasesResult.recordset;
        } catch (error) {
          results.databases = { error: error.message };
        }

        // 2. Tablo listesi
        try {
          const tablesResult = await pool.request().query(`
            SELECT 
              TABLE_SCHEMA as schema_name, 
              TABLE_NAME as table_name, 
              TABLE_TYPE as table_type 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
            ORDER BY TABLE_SCHEMA, TABLE_NAME
          `);
          results.tables = tablesResult.recordset;
        } catch (error) {
          results.tables = { error: error.message };
        }

        // 3. STOK_GRUP tablosu testi
        try {
          // Tablo yapısını kontrol et
          const structureResult = await pool.request().query(`
            SELECT 
              COLUMN_NAME as column_name,
              DATA_TYPE as data_type,
              IS_NULLABLE as is_nullable
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'STOK_GRUP'
            ORDER BY ORDINAL_POSITION
          `);
          results.stockGroupStructure = structureResult.recordset;
          
          // İlk 5 kaydı dene
          const sampleResult = await pool.request().query(`
            SELECT TOP 5 * FROM STOK_GRUP
          `);
          results.stockGroupSample = sampleResult.recordset;
        } catch (error) {
          results.stockGroupStructure = { error: error.message };
          results.stockGroupSample = { error: error.message };
        }

        // 4. STOK tablosu testi
        try {
          // Tablo yapısını kontrol et
          const structureResult = await pool.request().query(`
            SELECT 
              COLUMN_NAME as column_name,
              DATA_TYPE as data_type,
              IS_NULLABLE as is_nullable
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'STOK'
            ORDER BY ORDINAL_POSITION
          `);
          results.stockStructure = structureResult.recordset;
          
          // İlk 5 kaydı dene
          const sampleResult = await pool.request().query(`
            SELECT TOP 5 * FROM STOK
          `);
          results.stockSample = sampleResult.recordset;
        } catch (error) {
          results.stockStructure = { error: error.message };
          results.stockSample = { error: error.message };
        }

        // 5. QR Yayınlanan kayıtlar testi
        try {
          const qrPublishedResult = await pool.request().query(`
            SELECT 
              'STOK_GRUP' as table_name,
              COUNT(*) as qr_published_count,
              COUNT(CASE WHEN QRYAYINLANIR = 1 THEN 1 END) as qr_enabled_count
            FROM STOK_GRUP 
            WHERE AKTIF = 1
            UNION ALL
            SELECT 
              'STOK' as table_name,
              COUNT(*) as qr_published_count,
              COUNT(CASE WHEN QRYAYINLANIR = 1 THEN 1 END) as qr_enabled_count
            FROM STOK 
            WHERE AKTIF = 1
          `);
          results.qrPublishedStats = qrPublishedResult.recordset;
        } catch (error) {
          results.qrPublishedStats = { error: error.message };
        }

      } finally {
        await pool.close();
      }

      res.json({
        success: true,
        message: 'Test sorguları tamamlandı',
        data: results
      });

    } catch (error) {
      console.error('Test sorguları hatası:', error);
      res.status(500).json({
        success: false,
        message: `Test sorguları çalıştırılırken hata oluştu: ${error.message}`,
        error: error.message
      });
    }
  }

  // Özel sorgu testi
  async testCustomQuery(req, res) {
    try {
      const { user_id } = req.user;
      const { query } = req.body;
      
      if (!query || query.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Sorgu metni gerekli'
        });
      }

      const user = await User.findByPk(user_id);
      if (!user || !user.erp_server) {
        return res.status(400).json({
          success: false,
          message: 'ERP konfigürasyonu eksik'
        });
      }

      // Ortama göre SSL ayarları
      const isProduction = process.env.NODE_ENV === 'production';
      const isLocalNetwork = user.erp_server.includes('192.168.') || 
                           user.erp_server.includes('10.') || 
                           user.erp_server.includes('172.') ||
                           user.erp_server === 'localhost' ||
                           user.erp_server === '127.0.0.1';

      const sqlConfig = {
        server: user.erp_server,
        database: user.erp_database,
        user: user.erp_username,
        password: user.erp_password,
        port: user.erp_port || 1433,
        options: {
          encrypt: isProduction && !isLocalNetwork, // Canlı ortamda SSL, local'de kapalı
          trustServerCertificate: !isProduction || isLocalNetwork, // Local'de güven
          enableArithAbort: true,
          // SSL ayarları
          ssl: isProduction && !isLocalNetwork ? {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
          } : false
        }
      };

      const pool = await sql.connect(sqlConfig);
      
      try {
        const result = await pool.request().query(query);
        
        res.json({
          success: true,
          message: 'Özel sorgu başarıyla çalıştırıldı',
          data: {
            recordCount: result.recordset.length,
            columns: result.recordset.length > 0 ? Object.keys(result.recordset[0]) : [],
            records: result.recordset.slice(0, 100), // İlk 100 kayıt
            totalRecords: result.recordset.length
          }
        });

      } finally {
        await pool.close();
      }

    } catch (error) {
      console.error('Özel sorgu hatası:', error);
      res.status(500).json({
        success: false,
        message: `Özel sorgu çalıştırılırken hata oluştu: ${error.message}`,
        error: error.message
      });
    }
  }
}

module.exports = new ERPTestController();
