const Permission = require('./models/Permission');
const RolePermission = require('./models/RolePermission');
const sequelize = require('./db');

async function seedPermissions() {
  try {
    console.log('🔄 Varsayılan yetkiler oluşturuluyor...');

    // Temel yetkileri oluştur
    const permissions = [
      // Ürün yetkileri
      { name: 'products_read', description: 'Ürünleri görüntüleme', resource: 'products', action: 'read' },
      { name: 'products_create', description: 'Ürün oluşturma', resource: 'products', action: 'create' },
      { name: 'products_update', description: 'Ürün güncelleme', resource: 'products', action: 'update' },
      { name: 'products_delete', description: 'Ürün silme', resource: 'products', action: 'delete' },
      
      // Kategori yetkileri
      { name: 'categories_read', description: 'Kategorileri görüntüleme', resource: 'categories', action: 'read' },
      { name: 'categories_create', description: 'Kategori oluşturma', resource: 'categories', action: 'create' },
      { name: 'categories_update', description: 'Kategori güncelleme', resource: 'categories', action: 'update' },
      { name: 'categories_delete', description: 'Kategori silme', resource: 'categories', action: 'delete' },
      
      // Kullanıcı yetkileri
      { name: 'users_read', description: 'Kullanıcıları görüntüleme', resource: 'users', action: 'read' },
      { name: 'users_create', description: 'Kullanıcı oluşturma', resource: 'users', action: 'create' },
      { name: 'users_update', description: 'Kullanıcı güncelleme', resource: 'users', action: 'update' },
      { name: 'users_delete', description: 'Kullanıcı silme', resource: 'users', action: 'delete' },
      
      // Şube yetkileri
      { name: 'branches_read', description: 'Şubeleri görüntüleme', resource: 'branches', action: 'read' },
      { name: 'branches_create', description: 'Şube oluşturma', resource: 'branches', action: 'create' },
      { name: 'branches_update', description: 'Şube güncelleme', resource: 'branches', action: 'update' },
      { name: 'branches_delete', description: 'Şube silme', resource: 'branches', action: 'delete' },
      
      // QR yetkileri
      { name: 'qr_read', description: 'QR kodları görüntüleme', resource: 'qr', action: 'read' },
      { name: 'qr_create', description: 'QR kodu oluşturma', resource: 'qr', action: 'create' },
      { name: 'qr_update', description: 'QR kodu güncelleme', resource: 'qr', action: 'update' },
      { name: 'qr_delete', description: 'QR kodu silme', resource: 'qr', action: 'delete' },
      
      // Masa yetkileri
      { name: 'tables_read', description: 'Masaları görüntüleme', resource: 'tables', action: 'read' },
      { name: 'tables_create', description: 'Masa oluşturma', resource: 'tables', action: 'create' },
      { name: 'tables_update', description: 'Masa güncelleme', resource: 'tables', action: 'update' },
      { name: 'tables_delete', description: 'Masa silme', resource: 'tables', action: 'delete' },
      
      // Kampanya yetkileri
      { name: 'campaigns_read', description: 'Kampanyaları görüntüleme', resource: 'campaigns', action: 'read' },
      { name: 'campaigns_create', description: 'Kampanya oluşturma', resource: 'campaigns', action: 'create' },
      { name: 'campaigns_update', description: 'Kampanya güncelleme', resource: 'campaigns', action: 'update' },
      { name: 'campaigns_delete', description: 'Kampanya silme', resource: 'campaigns', action: 'delete' },
    ];

    // Yetkileri veritabanına ekle
    for (const permission of permissions) {
      await Permission.findOrCreate({
        where: { name: permission.name },
        defaults: permission
      });
    }

    console.log('✅ Varsayılan yetkiler oluşturuldu!');

    // Rol yetkilerini oluştur
    console.log('🔄 Rol yetkileri oluşturuluyor...');

    const rolePermissions = [
      // Admin yetkileri (tüm işletme yetkileri)
      { role: 'admin', permission_name: 'products_read', business_id: null },
      { role: 'admin', permission_name: 'products_create', business_id: null },
      { role: 'admin', permission_name: 'products_update', business_id: null },
      { role: 'admin', permission_name: 'products_delete', business_id: null },
      { role: 'admin', permission_name: 'categories_read', business_id: null },
      { role: 'admin', permission_name: 'categories_create', business_id: null },
      { role: 'admin', permission_name: 'categories_update', business_id: null },
      { role: 'admin', permission_name: 'categories_delete', business_id: null },
      { role: 'admin', permission_name: 'users_read', business_id: null },
      { role: 'admin', permission_name: 'users_create', business_id: null },
      { role: 'admin', permission_name: 'users_update', business_id: null },
      { role: 'admin', permission_name: 'users_delete', business_id: null },
      { role: 'admin', permission_name: 'branches_read', business_id: null },
      { role: 'admin', permission_name: 'branches_create', business_id: null },
      { role: 'admin', permission_name: 'branches_update', business_id: null },
      { role: 'admin', permission_name: 'branches_delete', business_id: null },
      { role: 'admin', permission_name: 'qr_read', business_id: null },
      { role: 'admin', permission_name: 'qr_create', business_id: null },
      { role: 'admin', permission_name: 'qr_update', business_id: null },
      { role: 'admin', permission_name: 'qr_delete', business_id: null },
      { role: 'admin', permission_name: 'campaigns_read', business_id: null },
      { role: 'admin', permission_name: 'campaigns_create', business_id: null },
      { role: 'admin', permission_name: 'campaigns_update', business_id: null },
      { role: 'admin', permission_name: 'campaigns_delete', business_id: null },

      // Manager yetkileri (sadece görüntüleme ve masa yönetimi)
      { role: 'manager', permission_name: 'products_read', business_id: null },
      { role: 'manager', permission_name: 'branches_read', business_id: null },
      { role: 'manager', permission_name: 'qr_read', business_id: null },
      { role: 'manager', permission_name: 'tables_read', business_id: null },
      { role: 'manager', permission_name: 'tables_create', business_id: null },
      { role: 'manager', permission_name: 'tables_update', business_id: null },
      { role: 'manager', permission_name: 'tables_delete', business_id: null },
    ];

    // Rol yetkilerini veritabanına ekle
    for (const rolePerm of rolePermissions) {
      const permission = await Permission.findOne({
        where: { name: rolePerm.permission_name }
      });

      if (permission) {
        await RolePermission.findOrCreate({
          where: {
            role: rolePerm.role,
            permission_id: permission.id,
            business_id: rolePerm.business_id
          },
          defaults: {
            role: rolePerm.role,
            permission_id: permission.id,
            business_id: rolePerm.business_id
          }
        });
      }
    }

    console.log('✅ Rol yetkileri oluşturuldu!');

  } catch (error) {
    console.error('❌ Yetki oluşturma hatası:', error);
  } finally {
    await sequelize.close();
  }
}

// Scripti çalıştır
seedPermissions(); 