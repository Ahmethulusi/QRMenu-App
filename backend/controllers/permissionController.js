const { Permission, RolePermission } = require('../models');
const User = require('../models/User');

// Yetki kontrolü
exports.checkPermission = async (req, res) => {
  try {
    const { resource, action, business_id, branch_id } = req.body;
    const user = req.user;

    console.log(`🔍 Yetki kontrolü: ${user.role} - ${resource}:${action}`);

    // Süper admin her şeyi yapabilir
    if (user.role === 'super_admin') {
      console.log('✅ Süper admin - her şeyi yapabilir');
      return res.json({ hasPermission: true });
    }

    // Yetkiyi bul
    const permission = await Permission.findOne({
      where: { resource, action }
    });

    if (!permission) {
      console.log('❌ Yetki bulunamadı:', { resource, action });
      return res.json({ hasPermission: false });
    }

    // Rol yetkisini kontrol et (business_id ve branch_id'yi dikkate alma)
    const rolePermission = await RolePermission.findOne({
      where: {
        role: user.role,
        permission_id: permission.id,
        is_active: true
      }
    });

    if (!rolePermission) {
      console.log('❌ Rol yetkisi bulunamadı veya pasif:', { role: user.role, permission_id: permission.id });
      return res.json({ hasPermission: false });
    }

    // Manager için şube kontrolü (eğer şube bazlı yetki varsa)
    if (user.role === 'manager' && branch_id && user.branch_id) {
      const hasBranchPermission = user.branch_id === branch_id;
      console.log(`🔍 Manager şube kontrolü: ${user.branch_id} === ${branch_id} = ${hasBranchPermission}`);
      return res.json({ hasPermission: hasBranchPermission });
    }

    console.log('✅ Yetki var:', { role: user.role, permission: permission.name });
    res.json({ hasPermission: true });
  } catch (error) {
    console.error('❌ Yetki kontrolü hatası:', error);
    res.status(500).json({ error: 'Yetki kontrolü hatası' });
  }
};

// Kullanıcının yetkilerini getir
exports.getUserPermissions = async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role === 'super_admin') {
      // Tüm yetkileri getir
      const permissions = await Permission.findAll();
      return res.json({ permissions: permissions.map(p => ({ resource: p.resource, action: p.action })) });
    }

    // Kullanıcının rol yetkilerini getir
    const rolePermissions = await RolePermission.findAll({
      where: {
        role: user.role,
        is_active: true // Sadece aktif yetkileri getir
      },
      include: [{
        model: Permission,
        as: 'permission' // Alias'ı belirt
      }]
    });

    const permissions = rolePermissions.map(rp => ({
      resource: rp.permission.resource, // Alias ile erişim
      action: rp.permission.action // Alias ile erişim
    }));

    res.json({ permissions });
  } catch (error) {
    console.error('Yetki getirme hatası:', error);
    res.status(500).json({ error: 'Yetki getirme hatası' });
  }
};

// Yetki güncelleme (sadece değişen yetkiyi güncelle)
exports.updateRolePermissions = async (req, res) => {
  try {
    console.log(' Normal update çağrıldı');
    
    const { role, permissions, business_id } = req.body;
    const user = req.user;

    if (user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    console.log('✅ Süper admin yetkisi var');
    console.log('Gelen yetkiler:', permissions);

    // Sadece değişen yetkileri işle
    let updatedCount = 0;
    for (const permission of permissions) {
      const perm = await Permission.findOne({
        where: { resource: permission.resource, action: permission.action }
      });

      if (perm) {
        // Mevcut rol yetkisini bul (business_id ve branch_id'yi dikkate alma)
        const rolePerm = await RolePermission.findOne({
          where: {
            role: role,
            permission_id: perm.id
            // business_id ve branch_id'yi kaldırdık
          }
        });

        console.log(`🔍 Aranan: role=${role}, permission_id=${perm.id}`);
        console.log(`🔍 Bulunan kayıt:`, rolePerm ? 'Var' : 'Yok');

        if (rolePerm) {
          // Mevcut kaydı güncelle
          await rolePerm.update({ is_active: permission.hasPermission });
          console.log(`✅ Yetki güncellendi: ${permission.resource}:${permission.action} = ${permission.hasPermission}`);
        } else {
          // Yeni kayıt oluştur (eğer yoksa)
          await RolePermission.create({
            role: role,
            permission_id: perm.id,
            business_id: business_id || null,
            branch_id: null,
            is_active: permission.hasPermission
          });
          console.log(`➕ Yeni yetki eklendi: ${permission.resource}:${permission.action} = ${permission.hasPermission}`);
        }
        
        updatedCount++;
      }
    }

    console.log(`✅ Toplam ${updatedCount} yetki işlendi`);
    res.json({ message: 'Yetki güncellendi', updatedCount });
  } catch (error) {
    console.error('❌ Yetki güncelleme hatası:', error);
    res.status(500).json({ error: 'Yetki güncelleme hatası: ' + error.message });
  }
};

// Tüm yetkileri listele
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });
    
    res.json({ permissions });
  } catch (error) {
    console.error('Yetki listeleme hatası:', error);
    res.status(500).json({ error: 'Yetki listeleme hatası' });
  }
};

// Rol yetkilerini getir (tüm yetkileri getir, is_active durumuna göre)
exports.getRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const business_id = req.query.business_id || null;

    console.log(`🔍 ${role} rolü yetkileri getiriliyor...`);

    // Tüm yetkileri al
    const allPermissions = await Permission.findAll();
    
    // Bu rol için tüm yetkileri al
    const rolePermissions = await RolePermission.findAll({
      where: {
        role: role,
        business_id: business_id,
        branch_id: null
      },
      include: [{ 
        model: Permission, 
        as: 'permission',
        attributes: ['id', 'resource', 'action', 'description', 'name']
      }]
    });

    console.log(`✅ ${rolePermissions.length} yetki bulundu`);

    // Tüm yetkileri döndür (is_active durumuna göre)
    const permissions = allPermissions.map(permission => {
      const rolePerm = rolePermissions.find(rp => rp.permission_id === permission.id);
      return {
        id: permission.id,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
        name: permission.name,
        is_active: rolePerm ? rolePerm.is_active : false
      };
    });

    res.json(permissions);
  } catch (error) {
    console.error('❌ Yetki getirme hatası:', error);
    res.status(500).json({ error: 'Yetkiler alınamadı: ' + error.message });
  }
};

// Test endpoint'i ekle
exports.testPermission = async (req, res) => {
  try {
    const { resource, action, role } = req.body;
    
    // Test kullanıcısı oluştur
    const testUser = {
      role: role || 'admin',
      business_id: 1,
      branch_id: 1
    };

    console.log(`🔍 Test: ${role} rolü - ${resource}:${action}`);

    // Süper admin kontrolü
    if (testUser.role === 'super_admin') {
      return res.json({ 
        hasPermission: true, 
        message: 'Süper admin her şeyi yapabilir' 
      });
    }

    // Yetkiyi bul
    const permission = await Permission.findOne({
      where: { resource, action }
    });

    if (!permission) {
      return res.json({ 
        hasPermission: false, 
        message: 'Yetki bulunamadı' 
      });
    }

    // Rol yetkisini kontrol et (yeni sistem)
    const rolePermission = await RolePermission.findOne({
      where: {
        role: testUser.role,
        permission_id: permission.id,
        is_active: true
      }
    });

    if (!rolePermission) {
      return res.json({ 
        hasPermission: false, 
        message: 'Bu rol için yetki yok veya pasif' 
      });
    }

    res.json({ 
      hasPermission: true, 
      message: 'Yetki var',
      permission: {
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action
      },
      rolePermission: {
        id: rolePermission.id,
        role: rolePermission.role,
        is_active: rolePermission.is_active
      }
    });

  } catch (error) {
    console.error('❌ Test hatası:', error);
    res.status(500).json({ error: 'Test hatası' });
  }
};

// Middleware için yetki kontrol fonksiyonu
exports.hasPermission = (resource, action) => {
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
        return res.status(403).json({ 
          error: 'Bu işlem için yetkiniz bulunmuyor',
          requiredPermission: `${resource}:${action}`
        });
      }

      next();
    } catch (error) {
      console.error('❌ Middleware yetki kontrolü hatası:', error);
      res.status(500).json({ error: 'Yetki kontrolü hatası' });
    }
  };
}; 

// Debug endpoint'i
exports.testUpdate = async (req, res) => {
  try {
    console.log('🔍 Test update çağrıldı');
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    const { role, permissions, business_id } = req.body;
    const user = req.user;

    console.log('Role:', role);
    console.log('Permissions:', permissions);
    console.log('Business ID:', business_id);
    console.log('User role:', user.role);

    if (user.role !== 'super_admin') {
      console.log('❌ Yetki yok');
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    console.log('✅ Süper admin yetkisi var');

    // Mevcut yetkileri sil
    await RolePermission.destroy({
      where: { role, business_id }
    });

    console.log('️ Eski yetkiler silindi');

    // Yeni yetkileri ekle
    for (const permission of permissions) {
      const perm = await Permission.findOne({
        where: { resource: permission.resource, action: permission.action }
      });

      if (perm) {
        await RolePermission.create({
          role,
          permission_id: perm.id,
          business_id
        });
        console.log(`✅ Yetki eklendi: ${permission.resource}:${permission.action}`);
      } else {
        console.log(`❌ Yetki bulunamadı: ${permission.resource}:${permission.action}`);
      }
    }

    console.log('✅ Tüm yetkiler güncellendi');
    res.json({ message: 'Yetkiler güncellendi' });
  } catch (error) {
    console.error('❌ Yetki güncelleme hatası:', error);
    res.status(500).json({ error: 'Yetki güncelleme hatası: ' + error.message });
  }
}; 