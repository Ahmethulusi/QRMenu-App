// Kullanıcı yetkilerini kontrol eden utility fonksiyonları

const API_URL = import.meta.env.VITE_API_URL;

// Kullanıcı bilgisini localStorage'dan al
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// API'den kullanıcının yetkilerini getir
export const getUserPermissions = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const response = await fetch(`${API_URL}/api/permissions/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.permissions || [];
    }
    return [];
  } catch (error) {
    console.error('Yetki getirme hatası:', error);
    return [];
  }
};

// Dinamik yetki kontrolü - API'den gelen yetkilere göre
export const canAccess = async (resource, action) => {
  try {
    const permissions = await getUserPermissions();
    return permissions.some(perm => 
      perm.resource === resource && perm.action === action
    );
  } catch (error) {
    console.error('Yetki kontrolü hatası:', error);
    return false;
  }
};

// Senkron yetki kontrolü için - önceden yüklenmiş yetkilerle
export const canAccessSync = (permissions, resource, action) => {
  if (!permissions || !Array.isArray(permissions)) return false;
  return permissions.some(perm => 
    perm.resource === resource && perm.action === action
  );
};

// Menü öğelerini filtrele - dinamik yetkilerle
export const filterMenuItems = async (items) => {
  try {
    const permissions = await getUserPermissions();
    
    return items.filter(item => {
      // Çıkış Yap her zaman görünür
      if (item.key === 'Logout') return true;
      
      // Ana menü kontrolü
      if (item.children) {
        const filteredChildren = item.children.map(child => {
          if (child.children) {
            const filteredSubChildren = child.children.filter(subChild => 
              canViewMenu(permissions, subChild.key)
            );
            return filteredSubChildren.length > 0 ? { ...child, children: filteredSubChildren } : null;
          }
          return canViewMenu(permissions, child.key) ? child : null;
        }).filter(Boolean);
        
        return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null;
      }
      
      return canViewMenu(permissions, item.key);
    }).filter(Boolean);
  } catch (error) {
    console.error('Menü filtreleme hatası:', error);
    return items; // Hata durumunda tüm menüyü göster
  }
};

// Rol bazlı menü kontrolü - dinamik yetkilerle
const canViewMenu = (permissions, menuKey) => {
  const menuPermissions = {
    'Foods': canAccessSync(permissions, 'products', 'read'),
    'Products': canAccessSync(permissions, 'products', 'read'),
    'Sort': canAccessSync(permissions, 'products', 'read'),
    'Categories': canAccessSync(permissions, 'categories', 'read'),
    'CategorySort': canAccessSync(permissions, 'categories', 'read'),
    'Branches': canAccessSync(permissions, 'branches', 'read'),
    'Roles': canAccessSync(permissions, 'users', 'read'),
    'Auth': canAccessSync(permissions, 'users', 'read'),
    'QRDesigns': canAccessSync(permissions, 'qrcodes', 'read'),
    'GeneralQR': canAccessSync(permissions, 'qrcodes', 'read'),
    'Tables': canAccessSync(permissions, 'tables', 'read'),
    'TableSections': canAccessSync(permissions, 'tables', 'read'),
    'DesignSettings': canAccessSync(permissions, 'qrcodes', 'update'),
    'NonOrderableQR': canAccessSync(permissions, 'qrcodes', 'read'),
    'OrderableQR': canAccessSync(permissions, 'tables', 'read'),
    'Price Changing': canAccessSync(permissions, 'products', 'update'),
    'Profile': true, // Profil her zaman görünür
    'Logout': true, // Çıkış Yap her zaman görünür
  };
  
  return menuPermissions[menuKey] || false;
};

// Buton ve işlem yetkileri - dinamik yetkilerle
export const canPerformAction = async (action) => {
  try {
    const permissions = await getUserPermissions();
    
    const actionPermissions = {
      'create_product': canAccessSync(permissions, 'products', 'create'),
      'edit_product': canAccessSync(permissions, 'products', 'update'),
      'delete_product': canAccessSync(permissions, 'products', 'delete'),
      'create_category': canAccessSync(permissions, 'categories', 'create'),
      'edit_category': canAccessSync(permissions, 'categories', 'update'),
      'delete_category': canAccessSync(permissions, 'categories', 'delete'),
      'create_user': canAccessSync(permissions, 'users', 'create'),
      'edit_user': canAccessSync(permissions, 'users', 'update'),
      'delete_user': canAccessSync(permissions, 'users', 'delete'),
      'create_branch': canAccessSync(permissions, 'branches', 'create'),
      'edit_branch': canAccessSync(permissions, 'branches', 'update'),
      'delete_branch': canAccessSync(permissions, 'branches', 'delete'),
    };

    return actionPermissions[action] || false;
  } catch (error) {
    console.error('İşlem yetkisi kontrolü hatası:', error);
    return false;
  }
};