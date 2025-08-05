const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RolePermission = require('../models/RolePermission');
const Permission = require('../models/Permission');
const { Op } = require('sequelize');

// JWT token'dan kullanıcıyı doğrula
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token gerekli' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.user_id);
    
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};

// Basit rol bazlı yetki kontrolü (şimdilik)
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Süper admin her şeyi yapabilir
      if (user.role === 'super_admin') {
        return next();
      }

      // Rol bazlı yetki kontrolü
      const permissions = {
        admin: {
          products: ['read', 'create', 'update', 'delete'],
          categories: ['read', 'create', 'update', 'delete'],
          users: ['read', 'create', 'update', 'delete'],
          branches: ['read', 'create', 'update', 'delete'],
          qr: ['read', 'create', 'update', 'delete'],
          campaigns: ['read', 'create', 'update', 'delete'],
        },
        manager: {
          products: ['read'],
          branches: ['read'],
          qr: ['read'],
          tables: ['read', 'create', 'update', 'delete'],
        }
      };

      const hasPermission = permissions[user.role]?.[resource]?.includes(action);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Bu işlem için yetkiniz yok' 
        });
      }

      next();
    } catch (error) {
      console.error('Yetki kontrolü hatası:', error);
      return res.status(500).json({ error: 'Yetki kontrolü hatası' });
    }
  };
};

// İşletme bazlı yetki kontrolü
const checkBusinessPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const businessId = req.params.business_id || req.body.business_id;
      
      // Süper admin her şeyi yapabilir
      if (user.role === 'super_admin') {
        return next();
      }

      // Admin sadece kendi işletmesini yönetebilir
      if (user.role === 'admin' && user.business_id !== parseInt(businessId)) {
        return res.status(403).json({ 
          error: 'Bu işletme için yetkiniz yok' 
        });
      }

      // Manager sadece kendi şubesini yönetebilir
      if (user.role === 'manager') {
        const branchId = req.params.branch_id || req.body.branch_id;
        if (!branchId || user.branch_id !== parseInt(branchId)) {
          return res.status(403).json({ 
            error: 'Bu şube için yetkiniz yok' 
          });
        }
      }

      next();
    } catch (error) {
      console.error('İşletme yetki kontrolü hatası:', error);
      return res.status(500).json({ error: 'Yetki kontrolü hatası' });
    }
  };
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkBusinessPermission
}; 