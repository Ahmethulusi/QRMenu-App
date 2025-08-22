import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import '../css/LanguageSelector.css';

const LanguageSelector = ({ className = '', showLabel = true, onLanguageChange }) => {
  const { languages, currentLanguage, changeLanguage, loading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (loading || !currentLanguage) {
    return <div className={`language-selector loading ${className}`}>...</div>;
  }

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
    
    // Parent component'e dil değişikliğini bildir
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`language-selector ${className}`}>
      {showLabel && <span className="language-label">Dil:</span>}
      
      <div className="language-dropdown">
        <button 
          className="language-button"
          onClick={toggleDropdown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="language-flag">
            {getLanguageFlag(currentLanguage.code)}
          </span>
          <span className="language-name">
            {currentLanguage.native_name}
          </span>
          <span className="dropdown-arrow">▼</span>
        </button>
        
        {isOpen && (
          <div className="language-dropdown-menu" role="listbox">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`language-option ${language.code === currentLanguage.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(language.code)}
                role="option"
                aria-selected={language.code === currentLanguage.code}
              >
                <span className="language-flag">
                  {getLanguageFlag(language.code)}
                </span>
                <span className="language-name">
                  {language.native_name}
                </span>
                {language.is_default && (
                  <span className="default-badge">Varsayılan</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
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
