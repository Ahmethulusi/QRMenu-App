const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Token'ı localStorage'dan al
const getToken = () => {
  return localStorage.getItem('token');
};

// API çağrısı yapan genel fonksiyon
export const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  console.log(`🔄 API çağrısı: ${API_URL}${endpoint}`);
  console.log('📋 Headers:', defaultHeaders);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    console.log(`📡 Response status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('❌ 401 Unauthorized - Token geçersiz');
      // Token geçersiz, kullanıcıyı logout yap
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
      return;
    }

    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (!response.ok) {
      console.error(`❌ API Hatası: ${response.status} - ${data.error || 'Bilinmeyen hata'}`);
      throw new Error(data.error || `HTTP ${response.status}: Bir hata oluştu`);
    }

    return data;
  } catch (error) {
    console.error('❌ API çağrısı hatası:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
};

// GET isteği
export const apiGet = (endpoint) => apiCall(endpoint);

// POST isteği
export const apiPost = (endpoint, data) => apiCall(endpoint, {
  method: 'POST',
  body: JSON.stringify(data),
});

// PUT isteği
export const apiPut = (endpoint, data) => apiCall(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data),
});

// DELETE isteği
export const apiDelete = (endpoint) => apiCall(endpoint, {
  method: 'DELETE',
});

// Auth API fonksiyonları
export const authAPI = {
  login: async (credentials) => {
    return apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    const token = getToken();
    
    if (!token) {
      throw new Error('Token bulunamadı');
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        throw new Error('Token geçersiz');
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Bir hata oluştu');
      }

      return await response.json();
    } catch (error) {
      console.error('Token doğrulama hatası:', error);
      throw error;
    }
  },
};

// Kullanıcı API fonksiyonları
export const userAPI = {
  getAllUsers: async (businessId) => {
    return apiCall(`/api/users?business_id=${businessId}`);
  },

  createUser: async (userData) => {
    return apiCall('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (userId, userData) => {
    return apiCall(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (userId) => {
    return apiCall(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  },

  updatePassword: async (userId, newPassword) => {
    return apiCall(`/api/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  },
};

// Rol kontrolü
export const checkRole = (requiredRoles) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return requiredRoles.includes(user.role);
};

// Kullanıcı bilgilerini al
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Token kontrolü
export const isAuthenticated = () => {
  return !!getToken();
};

// Yetki kontrolü API'si
export const checkPermissionAPI = async (resource, action, businessId = null, branchId = null) => {
  try {
    const response = await fetch(`${API_URL}/api/permissions/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        resource,
        action,
        business_id: businessId,
        branch_id: branchId
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

// Kullanıcı yetkilerini getir
export const getUserPermissionsAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/api/permissions/user`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return result.permissions;
    }
    return [];
  } catch (error) {
    console.error('Yetki getirme hatası:', error);
    return [];
  }
};

// Tüm yetkileri getir
export const getAllPermissionsAPI = async () => {
  try {
    const response = await fetch(`${API_URL}/api/permissions/all`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return result.permissions;
    }
    return [];
  } catch (error) {
    console.error('Yetki listeleme hatası:', error);
    return [];
  }
};

// Rol yetkilerini getir (is_active alanı ile)
export const getRolePermissionsAPI = async (role, businessId = null) => {
  try {
    const response = await fetch(`${API_URL}/api/permissions/role/${role}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Yetkiler alınamadı');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Yetki getirme hatası:', error);
    throw error;
  }
};

// Yetki güncelleme (is_active mantığı ile)
export const updateRolePermissionsAPI = async (role, permissions, businessId = null) => {
  try {
    const response = await fetch(`${API_URL}/api/permissions/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        role,
        permissions,
        business_id: businessId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Yetki güncelleme başarısız');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Yetki güncelleme hatası:', error);
    throw error;
  }
};

// Test yetki güncelleme
export const testUpdateRolePermissionsAPI = async (role, permissions, businessId) => {
  try {
    const response = await fetch(`${API_URL}/api/permissions/test-update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        role,
        permissions,
        business_id: businessId
      })
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }
    
    const errorData = await response.json();
    throw new Error(errorData.error || 'Yetki güncelleme başarısız');
  } catch (error) {
    console.error('Yetki güncelleme hatası:', error);
    throw error;
  }
};

// Label API fonksiyonları
export const labelAPI = {
  // Tüm etiketleri getir
  getAllLabels: async () => {
    try {
      console.log('🔄 Tüm etiketler getiriliyor...');
      const response = await apiCall('/api/labels');
      console.log('✅ Etiketler başarıyla getirildi:', response);
      return response;
    } catch (error) {
      console.error('❌ Etiket getirme hatası:', error);
      throw error;
    }
  },

  // Yeni etiket oluştur
  createLabel: async (labelData) => {
    try {
      console.log('🔄 Yeni etiket oluşturuluyor...', labelData);
      const response = await apiCall('/api/labels', {
        method: 'POST',
        body: JSON.stringify(labelData),
      });
      console.log('✅ Etiket başarıyla oluşturuldu:', response);
      return response;
    } catch (error) {
      console.error('❌ Etiket oluşturma hatası:', error);
      throw error;
    }
  },

  // Etiket güncelle
  updateLabel: async (labelId, labelData) => {
    try {
      console.log('🔄 Etiket güncelleniyor...', { labelId, labelData });
      const response = await apiCall(`/api/labels/${labelId}`, {
        method: 'PUT',
        body: JSON.stringify(labelData),
      });
      console.log('✅ Etiket başarıyla güncellendi:', response);
      return response;
    } catch (error) {
      console.error('❌ Etiket güncelleme hatası:', error);
      throw error;
    }
  },

  // Etiket sil
  deleteLabel: async (labelId) => {
    try {
      console.log('🔄 Etiket siliniyor...', labelId);
      const response = await apiCall(`/api/labels/${labelId}`, {
        method: 'DELETE',
      });
      console.log('✅ Etiket başarıyla silindi:', response);
      return response;
    } catch (error) {
      console.error('❌ Etiket silme hatası:', error);
      throw error;
    }
  },

  // Ürün etiketlerini getir
  getProductLabels: async (productId) => {
    try {
      console.log('🔄 Ürün etiketleri getiriliyor...', productId);
      const response = await apiCall(`/api/labels/product/${productId}`);
      console.log('✅ Ürün etiketleri başarıyla getirildi:', response);
      return response;
    } catch (error) {
      console.error('❌ Ürün etiketleri getirme hatası:', error);
      throw error;
    }
  },

  // Etiket ürünlerini getir
  getLabelProducts: async (labelId) => {
    try {
      console.log('🔄 Etiket ürünleri getiriliyor...', labelId);
      const response = await apiCall(`/api/labels/${labelId}/products`);
      console.log('✅ Etiket ürünleri başarıyla getirildi:', response);
      return response;
    } catch (error) {
      console.error('❌ Etiket ürünleri getirme hatası:', error);
      throw error;
    }
  }
};