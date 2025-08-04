// Kullanıcı yetkilerini kontrol eden utility fonksiyonları

const API_URL = import.meta.env.VITE_API_URL;

// Kullanıcı bilgisini localStorage'dan al
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// API'den yetki kontrolü yap
export const checkPermission = async (resource, action) => {
  try {
    const user = getCurrentUser();
    if (!user) return false;

    const response = await fetch(`${API_URL}/api/permissions/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        resource,
        action,
        business_id: user.business_id,
        branch_id: user.branch_id
      })
    });

    if (response.ok) {
      const result = await response.json();
      return result.hasPermission;
    }
    return false;
  } catch (error) {
    console.error('Yetki kontrolü hatası:', error);
    return false;
  }
};

// Menü öğelerini filtrele
export const filterMenuItems = (items, user) => {
  if (!user) return items;

  // Süper admin her şeyi görebilir
  if (user.role === 'super_admin') return items;

  return items.filter(item => {
    // Çıkış Yap her zaman görünür
    if (item.key === 'Logout') return true;
    
    // Ana menü kontrolü
    if (item.children) {
      const filteredChildren = item.children.map(child => {
        if (child.children) {
          const filteredSubChildren = child.children.filter(subChild => 
            canViewMenu(user, subChild.key)
          );
          return filteredSubChildren.length > 0 ? { ...child, children: filteredSubChildren } : null;
        }
        return canViewMenu(user, child.key) ? child : null;
      }).filter(Boolean);
      
      return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null;
    }
    
    return canViewMenu(user, item.key);
  }).filter(Boolean);
};

// Rol bazlı menü kontrolü
const canViewMenu = (user, menuKey) => {
  const menuPermissions = {
    'Foods': canAccess(user, 'products', 'read'),
    'Categories': canAccess(user, 'categories', 'read'),
    'Branches': canAccess(user, 'branches', 'read'),
    'Roles': canAccess(user, 'users', 'read'),
    'Auth': canAccess(user, 'users', 'read'), // Yetkilendirmeler için users read yetkisi
    'QRDesigns': canAccess(user, 'qr', 'read'),
    'GeneralQR': canAccess(user, 'qr', 'read'),
    'Tables': canAccess(user, 'tables', 'read'),
    'Price Changing': canAccess(user, 'products', 'update'),
    'Logout': true, // Çıkış Yap her zaman görünür
  };
  
  return menuPermissions[menuKey] || false;
};

// Rol bazlı yetki kontrolü
export const canAccess = (user, resource, action) => {
  if (!user) return false;
  
  // Süper admin her şeyi yapabilir
  if (user.role === 'super_admin') return true;
  
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
  
  return permissions[user.role]?.[resource]?.includes(action) || false;
};

// Buton ve işlem yetkileri
export const canPerformAction = (user, action) => {
  if (!user) return false;
  if (user.role === 'super_admin') return true;

  const actionPermissions = {
    'create_product': canAccess(user, 'products', 'create'),
    'edit_product': canAccess(user, 'products', 'update'),
    'delete_product': canAccess(user, 'products', 'delete'),
    'create_category': canAccess(user, 'categories', 'create'),
    'edit_category': canAccess(user, 'categories', 'update'),
    'delete_category': canAccess(user, 'categories', 'delete'),
    'create_user': canAccess(user, 'users', 'create'),
    'edit_user': canAccess(user, 'users', 'update'),
    'delete_user': canAccess(user, 'users', 'delete'),
    'create_branch': canAccess(user, 'branches', 'create'),
    'edit_branch': canAccess(user, 'branches', 'update'),
    'delete_branch': canAccess(user, 'branches', 'delete'),
  };

  return actionPermissions[action] || false;
};