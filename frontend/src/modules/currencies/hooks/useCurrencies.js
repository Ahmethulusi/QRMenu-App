import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useCurrencies = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/currencies/active`);
      
      if (!response.ok) {
        throw new Error('Para birimleri yüklenemedi');
      }
      
      const data = await response.json();
      setCurrencies(data);
    } catch (err) {
      console.error('Para birimleri yükleme hatası:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  return {
    currencies,
    loading,
    error,
    reload: loadCurrencies
  };
};
