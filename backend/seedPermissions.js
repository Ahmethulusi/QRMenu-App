const { Permission, RolePermission } = require('./models');
const sequelize = require('./db');

// Tüm izinleri tanımla
const permissions = [
  // Ürün yönetimi (7 izin)
  { name: 'product_create', description: 'Ürün oluşturma', resource: 'products', action: 'create' },
  { name: 'product_read', description: 'Ürün görüntüleme', resource: 'products', action: 'read' },
  { name: 'product_update', description: 'Ürün güncelleme', resource: 'products', action: 'update' },
  { name: 'product_delete', description: 'Ürün silme', resource: 'products', action: 'delete' },
  { name: 'product_image_upload', description: 'Ürün resmi yükleme', resource: 'products', action: 'image_upload' },
  { name: 'product_bulk_update', description: 'Toplu ürün güncelleme', resource: 'products', action: 'bulk_update' },
  { name: 'product_sort', description: 'Ürün sıralama', resource: 'products', action: 'sort' },
  
  // Kategori yönetimi (5 izin)
  { name: 'category_create', description: 'Kategori oluşturma', resource: 'categories', action: 'create' },
  { name: 'category_read', description: 'Kategori görüntüleme', resource: 'categories', action: 'read' },
  { name: 'category_update', description: 'Kategori güncelleme', resource: 'categories', action: 'update' },
  { name: 'category_delete', description: 'Kategori silme', resource: 'categories', action: 'delete' },
  { name: 'category_sort', description: 'Kategori sıralama', resource: 'categories', action: 'sort' },
  
  // Şube yönetimi (4 izin)
  { name: 'branch_create', description: 'Şube oluşturma', resource: 'branches', action: 'create' },
  { name: 'branch_read', description: 'Şube görüntüleme', resource: 'branches', action: 'read' },
  { name: 'branch_update', description: 'Şube güncelleme', resource: 'branches', action: 'update' },
  { name: 'branch_delete', description: 'Şube silme', resource: 'branches', action: 'delete' },
  
  // Kullanıcı yönetimi (4 izin)
  { name: 'user_create', description: 'Kullanıcı oluşturma', resource: 'users', action: 'create' },
  { name: 'user_read', description: 'Kullanıcı görüntüleme', resource: 'users', action: 'read' },
  { name: 'user_update', description: 'Kullanıcı güncelleme', resource: 'users', action: 'update' },
  { name: 'user_delete', description: 'Kullanıcı silme', resource: 'users', action: 'delete' },
  
  // QR kod yönetimi (4 izin)
  { name: 'qrcode_create', description: 'QR kod oluşturma', resource: 'qrcodes', action: 'create' },
  { name: 'qrcode_read', description: 'QR kod görüntüleme', resource: 'qrcodes', action: 'read' },
  { name: 'qrcode_update', description: 'QR kod güncelleme', resource: 'qrcodes', action: 'update' },
  { name: 'qrcode_delete', description: 'QR kod silme', resource: 'qrcodes', action: 'delete' },
  
  // Masa yönetimi (4 izin)
  { name: 'table_create', description: 'Masa oluşturma', resource: 'tables', action: 'create' },
  { name: 'table_read', description: 'Masa görüntüleme', resource: 'tables', action: 'read' },
  { name: 'table_update', description: 'Masa güncelleme', resource: 'tables', action: 'update' },
  { name: 'table_delete', description: 'Masa silme', resource: 'tables', action: 'delete' },
  
  // İşletme yönetimi (2 izin)
  { name: 'business_read', description: 'İşletme görüntüleme', resource: 'businesses', action: 'read' },
  { name: 'business_update', description: 'İşletme güncelleme', resource: 'businesses', action: 'update' },
  
  // Etiket yönetimi (4 izin)
  { name: 'label_create', description: 'Etiket oluşturma', resource: 'labels', action: 'create' },
  { name: 'label_read', description: 'Etiket görüntüleme', resource: 'labels', action: 'read' },
  { name: 'label_update', description: 'Etiket güncelleme', resource: 'labels', action: 'update' },
  { name: 'label_delete', description: 'Etiket silme', resource: 'labels', action: 'delete' },
  
  // Sistem yönetimi (4 izin)
  { name: 'system_settings', description: 'Sistem ayarları', resource: 'system', action: 'settings' },
  { name: 'system_logs', description: 'Sistem logları', resource: 'system', action: 'logs' },
  { name: 'permissions_read', description: 'Yetki görüntüleme', resource: 'permissions', action: 'read' },
  { name: 'permissions_update', description: 'Yetki güncelleme', resource: 'permissions', action: 'update' }
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
      'user_delete': false,
      'business_update': false,
      'system_logs': false
    }
  },
  manager: {
    // Sadece görüntüleme ve temel işlemler aktif
    default: false,
    exceptions: {
      'product_read': true,
      'product_update': true,
      'category_read': true,
      'category_update': true,
      'branch_read': true,
      'user_read': true,
      'qrcode_read': true,
      'table_read': true,
      'business_read': true,
      'permissions_read': true,
      'permissions_update': true
    }
  }
};

async function seedPermissions() {
  try {
    console.log('🔄 İzinler ve rol izinleri oluşturuluyor...');
    
    // 1. İzinleri oluştur
    console.log('📝 İzinler oluşturuluyor...');
    const createdPermissions = [];
    
    for (const permission of permissions) {
      const [createdPermission, created] = await Permission.findOrCreate({
        where: { name: permission.name },
        defaults: permission
      });
      
      if (created) {
        console.log(`✅ İzin oluşturuldu: ${permission.name}`);
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
    
    console.log('🎉 Tüm izinler ve rol izinleri başarıyla oluşturuldu!');
    console.log(`📊 Toplam ${permissions.length} izin`);
    console.log(`📊 Toplam ${roles.length} rol`);
    console.log(`📊 Toplam ${permissions.length * roles.length} rol izin kaydı`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await sequelize.close();
  }
}

// Script çalıştır
seedPermissions(); 