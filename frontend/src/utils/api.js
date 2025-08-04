const API_URL = import.meta.env.VITE_API_URL;

// Token'ı localStorage'dan al
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// API çağrısı için yardımcı fonksiyon
export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Token varsa Authorization header'ı ekle
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
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token geçersiz, kullanıcıyı logout yap
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error || 'Bir hata oluştu');
    }

    return await response.json();
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