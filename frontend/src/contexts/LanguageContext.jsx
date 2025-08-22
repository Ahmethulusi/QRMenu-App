import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGet } from '../utils/api';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [languages, setLanguages] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [defaultLanguage, setDefaultLanguage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tüm dilleri getir
  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/languages/all');
      setLanguages(response);
      
      // Varsayılan dili bul
      const defaultLang = response.find(lang => lang.is_default);
      if (defaultLang) {
        setDefaultLanguage(defaultLang);
        
        // Local storage'dan kayıtlı dili al, yoksa varsayılanı kullan
        const savedLang = localStorage.getItem('selectedLanguage');
        if (savedLang) {
          const savedLangData = response.find(lang => lang.code === savedLang);
          if (savedLangData) {
            setCurrentLanguage(savedLangData);
          } else {
            setCurrentLanguage(defaultLang);
          }
        } else {
          setCurrentLanguage(defaultLang);
        }
      }
    } catch (error) {
      console.error('Diller getirilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dil değiştir
  const changeLanguage = (languageCode) => {
    const language = languages.find(lang => lang.code === languageCode);
    if (language) {
      setCurrentLanguage(language);
      localStorage.setItem('selectedLanguage', languageCode);
    }
  };

  // Varsayılan dile dön
  const resetToDefault = () => {
    if (defaultLanguage) {
      setCurrentLanguage(defaultLanguage);
      localStorage.setItem('selectedLanguage', defaultLanguage.code);
    }
  };

  // Dil yönünü al (RTL için)
  const getTextDirection = () => {
    return currentLanguage?.direction || 'ltr';
  };

  // Çeviri yardımcı fonksiyonu
  const t = (key, fallback = '') => {
    // Bu fonksiyon ileride çeviri dosyalarından çeviri yapmak için kullanılabilir
    return fallback;
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const value = {
    languages,
    currentLanguage,
    defaultLanguage,
    loading,
    changeLanguage,
    resetToDefault,
    getTextDirection,
    t,
    fetchLanguages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
