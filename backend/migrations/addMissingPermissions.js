const { Permission, RolePermission } = require('../models');
const sequelize = require('../db');

// Eksik izinleri tanımla
const missingPermissions = [
  // Duyuru yönetimi (4 izin)
  { name: 'announcement_create', description: 'Duyuru oluşturma', resource: 'announcements', action: 'create' },
  { name: 'announcement_read', description: 'Duyuru görüntüleme', resource: 'announcements', action: 'read' },
  { name: 'announcement_update', description: 'Duyuru güncelleme', resource: 'announcements', action: 'update' },
  { name: 'announcement_delete', description: 'Duyuru silme', resource: 'announcements', action: 'delete' },
  
  // ERP yönetimi (4 izin)
  { name: 'erp_create', description: 'ERP entegrasyonu oluşturma', resource: 'erp', action: 'create' },
  { name: 'erp_read', description: 'ERP entegrasyonu görüntüleme', resource: 'erp', action: 'read' },
  { name: 'erp_update', description: 'ERP entegrasyonu güncelleme', resource: 'erp', action: 'update' },
  { name: 'erp_delete', description: 'ERP entegrasyonu silme', resource: 'erp', action: 'delete' },
  
  // Para birimi yönetimi (4 izin)
  { name: 'currency_create', description: 'Para birimi oluşturma', resource: 'currencies', action: 'create' },
  { name: 'currency_read', description: 'Para birimi görüntüleme', resource: 'currencies', action: 'read' },
  { name: 'currency_update', description: 'Para birimi güncelleme', resource: 'currencies', action: 'update' },
  { name: 'currency_delete', description: 'Para birimi silme', resource: 'currencies', action: 'delete' },
  
  // İşletme profili yönetimi (2 izin)
  { name: 'business_profile_read', description: 'İşletme profili görüntüleme', resource: 'business_profile', action: 'read' },
  { name: 'business_profile_update', description: 'İşletme profili güncelleme', resource: 'business_profile', action: 'update' },
  
  // Dil yönetimi (4 izin)
  { name: 'language_create', description: 'Dil oluşturma', resource: 'languages', action: 'create' },
  { name: 'language_read', description: 'Dil görüntüleme', resource: 'languages', action: 'read' },
  { name: 'language_update', description: 'Dil güncelleme', resource: 'languages', action: 'update' },
  { name: 'language_delete', description: 'Dil silme', resource: 'languages', action: 'delete' }
];

// Roller
const roles = ['super_admin', 'admin', 'manager'];

// Her rol için varsayılan izin durumları
const roleDefaultPermissions = {
  super_admin: {
    // Tüm izinler aktif
    default: true
  },
  admin: {
    // Çoğu izin aktif, bazı kritik olanlar pasif
    default: true,
    exceptions: {
      'business_profile_update': false, // İşletme profili sadece super_admin güncelleyebilir
      'erp_delete': false // ERP silme sadece super_admin yapabilir
    }
  },
  manager: {
    // Sadece görüntüleme ve temel işlemler aktif
    default: false,
    exceptions: {
      'announcement_read': true,
      'announcement_create': true,
      'announcement_update': true,
      'erp_read': true,
      'currency_read': true,
      'business_profile_read': true,
      'language_read': true
    }
  }
};

async function addMissingPermissions() {
  try {
    console.log('🔄 Eksik izinler ekleniyor...');
    
    // 1. Eksik izinleri oluştur
    console.log('📝 Eksik izinler oluşturuluyor...');
    const createdPermissions = [];
    
    for (const permission of missingPermissions) {
      const [createdPermission, created] = await Permission.findOrCreate({
        where: { name: permission.name },
        defaults: permission
      });
      
      if (created) {
        console.log(`✅ Yeni izin oluşturuldu: ${permission.name}`);
      } else {
        console.log(`🔄 İzin zaten mevcut: ${permission.name}`);
      }
      
      createdPermissions.push(createdPermission);
    }
    
    // 2. Her rol için her izin için kayıt oluştur
    console.log('🔐 Rol izinleri oluşturuluyor...');
    
    for (const role of roles) {
      const roleConfig = roleDefaultPermissions[role];
      
      for (const permission of createdPermissions) {
        const isActive = roleConfig.exceptions && roleConfig.exceptions[permission.name] !== undefined
          ? roleConfig.exceptions[permission.name]
          : roleConfig.default;
        
        // Önce mevcut kaydı kontrol et
        const [rolePermission, created] = await RolePermission.findOrCreate({
          where: {
            role: role,
            permission_id: permission.id
          },
          defaults: {
            role: role,
            permission_id: permission.id,
            business_id: null,
            branch_id: null,
            is_active: isActive
          }
        });
        
        if (!created) {
          // Mevcut kaydı güncelle
          await rolePermission.update({ is_active: isActive });
          console.log(`✅ ${role} - ${permission.name}: ${isActive ? 'Aktif' : 'Pasif'} (güncellendi)`);
        } else {
          console.log(`✅ ${role} - ${permission.name}: ${isActive ? 'Aktif' : 'Pasif'} (oluşturuldu)`);
        }
      }
    }
    
    console.log('🎉 Eksik izinler başarıyla eklendi!');
    console.log(`📊 Toplam ${missingPermissions.length} yeni izin`);
    console.log(`📊 Toplam ${roles.length} rol`);
    console.log(`📊 Toplam ${missingPermissions.length * roles.length} yeni rol izin kaydı`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await sequelize.close();
  }
}

// Script çalıştır
addMissingPermissions();
