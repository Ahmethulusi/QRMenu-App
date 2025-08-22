import React, { useState, useEffect } from 'react';
import { Card, Tabs, message, Spin } from 'antd';
import { GlobalOutlined, TranslationOutlined, SettingOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import ProductTranslations from './ProductTranslations';
import CategoryTranslations from './CategoryTranslations';
import AnnouncementTranslations from './AnnouncementTranslations';
import BusinessTranslations from './BusinessTranslations';
import UserTranslations from './UserTranslations';
import PermissionTranslations from './PermissionTranslations';
import '../css/LanguageSettings.css';

const { TabPane } = Tabs;

const LanguageSettings = () => {
  const { currentLanguage, changeLanguage, loading: languageLoading } = useLanguage();
  const [activeTab, setActiveTab] = useState('products');

  const handleSuccess = (messageText) => {
    message.success(messageText || 'İşlem başarılı!');
  };

  const handleError = (messageText) => {
    message.error(messageText || 'Bir hata oluştu!');
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleLanguageChange = (newLanguageCode) => {
    console.log('🌐 Dil değişti:', newLanguageCode);
    // Dil değiştiğinde tab'ları yeniden yükle
    // Bu sayede çeviri durumları güncellenecek
  };

  if (languageLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Diller yükleniyor...</div>
      </div>
    );
  }

  if (!currentLanguage) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Dil seçimi yapılamadı</div>
      </div>
    );
  }

  return (
    <div className="language-settings">
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GlobalOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <span>Dil Ayarları</span>
          </div>
        }
        className="language-settings-card"
      >
        <div style={{ marginBottom: '24px' }}>
          <LanguageSelector onLanguageChange={handleLanguageChange} />
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          type="card"
          items={[
            {
              key: 'products',
              label: (
                <span>
                  <TranslationOutlined />
                  Ürün Çevirileri
                </span>
              ),
              children: <ProductTranslations 
                currentLanguage={currentLanguage} 
                onSuccess={handleSuccess}
                onError={handleError}
              />
            },
            {
              key: 'categories',
              label: (
                <span>
                  <TranslationOutlined />
                  Kategori Çevirileri
                </span>
              ),
              children: <CategoryTranslations 
                currentLanguage={currentLanguage} 
                onSuccess={handleSuccess}
                onError={handleError}
              />
            },
            {
              key: 'announcements',
              label: (
                <span>
                  <TranslationOutlined />
                  Duyuru Çevirileri
                </span>
              ),
              children: <AnnouncementTranslations 
                currentLanguage={currentLanguage} 
                onSuccess={handleSuccess}
                onError={handleError}
              />
            },
            {
              key: 'businesses',
              label: (
                <span>
                  <TranslationOutlined />
                  İşletme Çevirileri
                </span>
              ),
              children: <BusinessTranslations 
                currentLanguage={currentLanguage} 
                onSuccess={handleSuccess}
                onError={handleError}
              />
            },
            {
              key: 'users',
              label: (
                <span>
                  <TranslationOutlined />
                  Kullanıcı Çevirileri
                </span>
              ),
              children: <UserTranslations 
                currentLanguage={currentLanguage} 
                onSuccess={handleSuccess}
                onError={handleError}
              />
            },
            {
              key: 'permissions',
              label: (
                <span>
                  <TranslationOutlined />
                  Yetki Çevirileri
                </span>
              ),
              children: <PermissionTranslations 
                currentLanguage={currentLanguage} 
                onSuccess={handleSuccess}
                onError={handleError}
              />
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default LanguageSettings;
