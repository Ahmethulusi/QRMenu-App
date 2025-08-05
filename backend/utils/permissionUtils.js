const RolePermission = require('../models/RolePermission');
const Permission = require('../models/Permission');
const sequelize = require('../db'); // db.js'deki Sequelize instance'ını kullanıyoruz

// Kullanıcının belirli bir yetkisi var mı kontrol et
async function hasPermission(user, resource, action, businessId = null, branchId = null) {
  try {
    // Süper admin her şeyi yapabilir
    if (user.role === 'super_admin') {
      return true;
    }

    // Yetkiyi bul
    const permission = await Permission.findOne({
      where: { resource, action }
    });

    if (!permission) {
      return false;
    }

    // Rol yetkisini kontrol et
    const rolePermission = await RolePermission.findOne({
      where: {
        role: user.role,
        permission_id: permission.id,
        [sequelize.Op.or]: [
          { business_id: businessId || user.business_id },
          { business_id: null }
        ]
      }
    });

    if (!rolePermission) {
      return false;
    }

    // Manager için şube kontrolü
    if (user.role === 'manager' && branchId) {
      return user.branch_id === branchId;
    }

    return true;
  } catch (error) {
    console.error('Yetki kontrolü hatası:', error);
    return false;
  }
}

// Kullanıcının menü öğelerini görüp göremeyeceğini kontrol et
async function canViewMenu(user, menuKey) {
  const menuPermissions = {
    'Foods': await hasPermission(user, 'products', 'read'),
    'Categories': await hasPermission(user, 'categories', 'read'),
    'Branches': await hasPermission(user, 'branches', 'read'),
    'Roles': await hasPermission(user, 'users', 'read'),
    'QRDesigns': await hasPermission(user, 'qr', 'read'),
    'GeneralQR': await hasPermission(user, 'qr', 'read'),
    'Tables': await hasPermission(user, 'tables', 'read'),
  };

  return menuPermissions[menuKey] || false;
}

module.exports = {
  hasPermission,
  canViewMenu
}; 