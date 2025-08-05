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

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token geçersiz, kullanıcıyı logout yap
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
      return;
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Bir hata oluştu');
    }

    return data;
  } catch (error) {
    console.error('API çağrısı hatası:', error);
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
    return apiCall('/api/auth/me');
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