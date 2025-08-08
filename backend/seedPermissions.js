const Permission = require('./models/Permission');
const RolePermission = require('./models/RolePermission');
const sequelize = require('./db');

async function seedPermissions() {
  try {
    console.log(' Yetkiler ekleniyor...');

    // Temel yetkileri oluştur
    const permissions = [
      // Ürün yetkileri
      { resource: 'products', action: 'read', description: 'Ürünleri görüntüleme', name: 'products_read' },
      { resource: 'products', action: 'create', description: 'Ürün oluşturma', name: 'products_create' },
      { resource: 'products', action: 'update', description: 'Ürün güncelleme', name: 'products_update' },
      { resource: 'products', action: 'delete', description: 'Ürün silme', name: 'products_delete' },
      
      // Kategori yetkileri
      { resource: 'categories', action: 'read', description: 'Kategorileri görüntüleme', name: 'categories_read' },
      { resource: 'categories', action: 'create', description: 'Kategori oluşturma', name: 'categories_create' },
      { resource: 'categories', action: 'update', description: 'Kategori güncelleme', name: 'categories_update' },
      { resource: 'categories', action: 'delete', description: 'Kategori silme', name: 'categories_delete' },
      
      // Kullanıcı yetkileri
      { resource: 'users', action: 'read', description: 'Kullanıcıları görüntüleme', name: 'users_read' },
      { resource: 'users', action: 'create', description: 'Kullanıcı oluşturma', name: 'users_create' },
      { resource: 'users', action: 'update', description: 'Kullanıcı güncelleme', name: 'users_update' },
      { resource: 'users', action: 'delete', description: 'Kullanıcı silme', name: 'users_delete' },
      
      // Şube yetkileri
      { resource: 'branches', action: 'read', description: 'Şubeleri görüntüleme', name: 'branches_read' },
      { resource: 'branches', action: 'create', description: 'Şube oluşturma', name: 'branches_create' },
      { resource: 'branches', action: 'update', description: 'Şube güncelleme', name: 'branches_update' },
      { resource: 'branches', action: 'delete', description: 'Şube silme', name: 'branches_delete' },
      
      // QR kod yetkileri
      { resource: 'qr', action: 'read', description: 'QR kodları görüntüleme', name: 'qr_read' },
      { resource: 'qr', action: 'create', description: 'QR kod oluşturma', name: 'qr_create' },
      
      // Yetki yönetimi yetkileri
      { resource: 'permissions', action: 'read', description: 'Yetkileri görüntüleme', name: 'permissions_read' },
      { resource: 'permissions', action: 'update', description: 'Yetki güncelleme', name: 'permissions_update' }
    ];

    // Yetkileri ekle
    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { resource: permission.resource, action: permission.action },
        defaults: permission
      });
    }

    console.log('✅ Temel yetkiler eklendi');

    // Tüm yetkileri al
    const allPermissions = await Permission.findAll();
    const roles = ['super_admin', 'admin', 'manager'];

    console.log('🔄 Tüm roller için tüm yetkiler oluşturuluyor...');

    // Her rol için tüm yetkileri oluştur (upsert kullan)
    for (const role of roles) {
      for (const permission of allPermissions) {
        // Varsayılan yetki durumları
        let isActive = false;
        
        // Super Admin: Tüm yetkiler aktif
        if (role === 'super_admin') {
          isActive = true;
        }
        // Admin: Tüm yetkiler aktif
        else if (role === 'admin') {
          isActive = true;
        }
        // Manager: Sadece okuma yetkileri aktif
        else if (role === 'manager') {
          if (permission.action === 'read') {
            isActive = true;
          }
        }

        // Upsert kullan (varsa güncelle, yoksa oluştur)
        await RolePermission.upsert({
          role: role,
          permission_id: permission.id,
          business_id: null,
          branch_id: null,
          is_active: isActive
        });
      }
    }

    console.log('✅ Tüm roller için tüm yetkiler oluşturuldu');
    console.log('✅ Yetki sistemi kurulumu tamamlandı!');

  } catch (error) {
    console.error('❌ Yetki ekleme hatası:', error);
  } finally {
    await sequelize.close();
  }
}

// Scripti çalıştır
seedPermissions(); 