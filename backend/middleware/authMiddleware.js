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
      console.log('❌ Token bulunamadı');
      return res.status(401).json({ error: 'Token bulunamadı' });
    }

    // JWT_SECRET için fallback ekle
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.user_id);

    if (!user) {
      console.log('❌ Kullanıcı bulunamadı');
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    req.user = user;
    console.log(`✅ Kullanıcı doğrulandı: ${user.username} (${user.role})`);
    next();
  } catch (error) {
    console.error('❌ Token doğrulama hatası:', error);
    res.status(401).json({ error: 'Geçersiz token' });
  }
};

// Yetki kontrolü
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Süper admin her şeyi yapabilir
      if (user.role === 'super_admin') {
        return next();
      }

      // Yetkiyi bul
      const permission = await Permission.findOne({
        where: { resource, action }
      });

      if (!permission) {
        return res.status(403).json({ error: 'Yetki bulunamadı' });
      }

      // Rol yetkisini kontrol et
      const rolePermission = await RolePermission.findOne({
        where: {
          role: user.role,
          permission_id: permission.id,
          is_active: true
        }
      });

      if (!rolePermission) {
        return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
      }

      next();
    } catch (error) {
      console.error('Yetki kontrolü hatası:', error);
      res.status(500).json({ error: 'Yetki kontrolü hatası' });
    }
  };
};

// İşletme bazlı yetki kontrolü
const checkBusinessPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const businessId = req.params.businessId || req.body.business_id;

      // Süper admin her şeyi yapabilir
      if (user.role === 'super_admin') {
        return next();
      }

      // Admin sadece kendi işletmesini yönetebilir
      if (user.role === 'admin' && user.business_id !== businessId) {
        return res.status(403).json({ error: 'Bu işletme için yetkiniz yok' });
      }

      // Manager sadece kendi şubesini yönetebilir
      if (user.role === 'manager') {
        const branchId = req.params.branchId || req.body.branch_id;
        if (user.branch_id !== branchId) {
          return res.status(403).json({ error: 'Bu şube için yetkiniz yok' });
        }
      }

      next();
    } catch (error) {
      console.error('İşletme yetki kontrolü hatası:', error);
      res.status(500).json({ error: 'İşletme yetki kontrolü hatası' });
    }
  };
};

module.exports = {
  authenticateToken,
  checkPermission,
  checkBusinessPermission
}; 