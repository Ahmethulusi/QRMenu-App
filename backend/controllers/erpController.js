const ERPIntegration = require('../utils/erpIntegration');
const { User } = require('../models');

class ERPController {
  // Kullanıcının ERP konfigürasyonunu al
  async getUserERPConfig(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return {
          success: false,
          message: 'Kullanıcı bulunamadı'
        };
      }

      if (!user.erp_enabled) {
        return {
          success: false,
          message: 'ERP entegrasyonu aktif değil'
        };
      }

      if (!user.erp_server || !user.erp_database || !user.erp_username) {
        return {
          success: false,
          message: 'ERP konfigürasyonu eksik'
        };
      }

      return {
        success: true,
        data: {
          user_id: user.id,
          business_id: user.business_id,
          erp_server: user.erp_server,
          erp_database: user.erp_database,
          erp_username: user.erp_username,
          erp_password: user.erp_password,
          erp_port: user.erp_port || 1433
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `ERP konfigürasyon hatası: ${error.message}`
      };
    }
  }

  // ERP bağlantı bilgilerini güncelle
  async updateERPConfig(req, res) {
    try {
      const { user_id } = req.user;
      const { 
        erp_server, 
        erp_database, 
        erp_username, 
        erp_password, 
        erp_port,
        erp_enabled 
      } = req.body;

      // Kullanıcıyı bul ve ERP bilgilerini güncelle
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
        erp_enabled: erp_enabled || false
      });

      res.json({
        success: true,
        message: 'ERP bağlantı bilgileri güncellendi',
        data: {
          erp_server: user.erp_server,
          erp_database: user.erp_database,
          erp_username: user.erp_username,
          erp_port: user.erp_port,
          erp_enabled: user.erp_enabled
        }
      });

    } catch (error) {
      console.error('ERP config güncelleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'ERP bağlantı bilgileri güncellenirken hata oluştu'
      });
    }
  }

  // ERP bağlantısını test et
  async testConnection(req, res) {
    try {
      const { user_id } = req.user;
      
      const user = await User.findByPk(user_id);
      if (!user || !user.erp_enabled) {
        return res.status(400).json({
          success: false,
          message: 'ERP entegrasyonu aktif değil veya kullanıcı bulunamadı'
        });
      }

      const erpIntegration = new ERPIntegration(user);
      const result = await erpIntegration.testConnection();

      res.json(result);

    } catch (error) {
      console.error('ERP bağlantı test hatası:', error);
      res.status(500).json({
        success: false,
        message: 'ERP bağlantısı test edilirken hata oluştu'
      });
    }
  }

  // Kategorileri senkronize et
  async syncCategories(req, res) {
    try {
      const { user_id } = req.user;
      
      const user = await User.findByPk(user_id);
      if (!user || !user.erp_enabled) {
        return res.status(400).json({
          success: false,
          message: 'ERP entegrasyonu aktif değil veya kullanıcı bulunamadı'
        });
      }

      const erpIntegration = new ERPIntegration(user);
      const result = await erpIntegration.syncCategories();

      if (result.success) {
        // Son senkronizasyon tarihini güncelle
        await user.update({ last_sync_date: new Date() });
      }

      res.json(result);

    } catch (error) {
      console.error('Kategori senkronizasyon hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Kategoriler senkronize edilirken hata oluştu'
      });
    }
  }

  // Ürünleri senkronize et
  async syncProducts(req, res) {
    try {
      const { user_id } = req.user;
      
      const user = await User.findByPk(user_id);
      if (!user || !user.erp_enabled) {
        return res.status(400).json({
          success: false,
          message: 'ERP entegrasyonu aktif değil veya kullanıcı bulunamadı'
        });
      }

      const erpIntegration = new ERPIntegration(user);
      const result = await erpIntegration.syncProducts();

      if (result.success) {
        // Son senkronizasyon tarihini güncelle
        await user.update({ last_sync_date: new Date() });
      }

      res.json(result);

    } catch (error) {
      console.error('Ürün senkronizasyon hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Ürünler senkronize edilirken hata oluştu'
      });
    }
  }

  // Tam senkronizasyon
  async fullSync(req, res) {
    try {
      const userConfig = await this.getUserERPConfig(req.user.user_id);
      if (!userConfig.success) {
        return res.status(400).json(userConfig);
      }

      const erpIntegration = new ERPIntegration(userConfig.data);
      const result = await erpIntegration.fullSync();

      if (result.success) {
        // Son senkronizasyon tarihini güncelle
        await User.update(
          { last_sync_date: new Date() },
          { where: { user_id: req.user.user_id } }
        );
      }

      return res.json(result);
    } catch (error) {
      console.error('Tam senkronizasyon hatası:', error);
      return res.status(500).json({
        success: false,
        message: `Tam senkronizasyon hatası: ${error.message}`
      });
    }
  }

  // Stok güncelleme
  async updateStockLevels(req, res) {
    try {
      const userConfig = await this.getUserERPConfig(req.user.user_id);
      if (!userConfig.success) {
        return res.status(400).json(userConfig);
      }

      const erpIntegration = new ERPIntegration(userConfig.data);
      const result = await erpIntegration.updateStockLevels();

      return res.json(result);
    } catch (error) {
      console.error('Stok güncelleme hatası:', error);
      return res.status(500).json({
        success: false,
        message: `Stok güncelleme hatası: ${error.message}`
      });
    }
  }

  // ERP durumu
  async getERPStatus(req, res) {
    try {
      console.log('getERPStatus - req.user:', req.user);
      const user = await User.findByPk(req.user.user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }

      // Debug bilgisi ekle
      const hasConfig = !!(user.erp_server && user.erp_database && user.erp_username);
      console.log('ERP Status Debug:', {
        user_id: user.id,
        erp_server: user.erp_server,
        erp_database: user.erp_database,
        erp_username: user.erp_username,
        has_config: hasConfig
      });

      return res.json({
        success: true,
        data: {
          erp_enabled: user.erp_enabled,
          erp_server: user.erp_server,
          erp_database: user.erp_database,
          last_sync_date: user.last_sync_date,
          has_config: hasConfig
        }
      });
    } catch (error) {
      console.error('ERP durumu hatası:', error);
      return res.status(500).json({
        success: false,
        message: `ERP durumu hatası: ${error.message}`
      });
    }
  }
}

module.exports = new ERPController();
