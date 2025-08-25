import React from 'react';
import { Select } from 'antd';
import { useLanguage } from '../../../contexts/LanguageContext';

const { Option } = Select;

const LanguageSelector = ({ className = '', showLabel = true, onLanguageChange }) => {
  const { languages, currentLanguage, changeLanguage, loading } = useLanguage();

  if (loading || !currentLanguage) {
    return <div className={`language-selector loading ${className}`}>...</div>;
  }

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    
    // Parent component'e dil değişikliğini bildir
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };

  return (
    <div className={`language-selector ${className}`}>
      {showLabel && <span className="language-label">Dil:</span>}
      
      <Select
        value={currentLanguage.code}
        onChange={handleLanguageChange}
        style={{ width: 150 }}
        placeholder="Dil seçiniz"
        loading={loading}
      >
        {languages.map((language) => (
          <Option key={language.code} value={language.code}>
            <span style={{ marginRight: 8 }}>{getLanguageFlag(language.code)}</span>
            {language.native_name}
            {language.is_default && (
              <span style={{ 
                marginLeft: 8, 
                fontSize: '10px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                padding: '2px 6px', 
                borderRadius: '10px' 
              }}>
                Varsayılan
              </span>
            )}
          </Option>
        ))}
      </Select>
    </div>
  );
};

// Dil koduna göre bayrak emoji'si döndür
const getLanguageFlag = (languageCode) => {
  const flagMap = {
    'tr': '🇹🇷',
    'en': '🇺🇸',
    'de': '🇩🇪',
    'fr': '🇫🇷',
    'es': '🇪🇸',
    'it': '🇮🇹',
    'ru': '🇷🇺',
    'ar': '🇸🇦',
    'zh': '🇨🇳',
    'ja': '🇯🇵',
    'ko': '🇰🇷'
  };
  
  return flagMap[languageCode] || '🌐';
};

export default LanguageSelector;
