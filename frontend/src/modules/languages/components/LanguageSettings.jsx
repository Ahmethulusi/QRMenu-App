import React, { useState, useEffect } from 'react';
import { Card, Select, message, Spin, Space } from 'antd';
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

const { Option } = Select;

const LanguageSettings = () => {
  const { currentLanguage, changeLanguage, loading: languageLoading } = useLanguage();
  const [selectedModule, setSelectedModule] = useState('products');

  const handleSuccess = (messageText) => {
    message.success(messageText || 'İşlem başarılı!');
  };

  const handleError = (messageText) => {
    message.error(messageText || 'Bir hata oluştu!');
  };

  const handleModuleChange = (moduleKey) => {
    setSelectedModule(moduleKey);
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

  const moduleOptions = [
    { key: 'products', label: 'Ürün Çevirileri', icon: <TranslationOutlined /> },
    { key: 'categories', label: 'Kategori Çevirileri', icon: <TranslationOutlined /> },
    { key: 'announcements', label: 'Duyuru Çevirileri', icon: <TranslationOutlined /> },
    { key: 'businesses', label: 'İşletme Çevirileri', icon: <TranslationOutlined /> },
    { key: 'users', label: 'Kullanıcı Çevirileri', icon: <TranslationOutlined /> },
    { key: 'permissions', label: 'Yetki Çevirileri', icon: <TranslationOutlined /> }
  ];

  const renderSelectedModule = () => {
    switch (selectedModule) {
      case 'products':
        return (
          <ProductTranslations 
            currentLanguage={currentLanguage} 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        );
      case 'categories':
        return (
          <CategoryTranslations 
            currentLanguage={currentLanguage} 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        );
      case 'announcements':
        return (
          <AnnouncementTranslations 
            currentLanguage={currentLanguage} 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        );
      case 'businesses':
        return (
          <BusinessTranslations 
            currentLanguage={currentLanguage} 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        );
      case 'users':
        return (
          <UserTranslations 
            currentLanguage={currentLanguage} 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        );
      case 'permissions':
        return (
          <PermissionTranslations 
            currentLanguage={currentLanguage} 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        );
      default:
        return <div>Modül seçiniz</div>;
    }
  };

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
          <Space size="large">
            <LanguageSelector onLanguageChange={handleLanguageChange} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 500, color: '#595959' }}>Modül:</span>
              <Select
                value={selectedModule}
                onChange={handleModuleChange}
                style={{ width: 200 }}
                placeholder="Modül seçiniz"
              >
                {moduleOptions.map(option => (
                  <Option key={option.key} value={option.key}>
                    <Space>
                      {option.icon}
                      {option.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
          </Space>
        </div>

        <div className="module-content">
          {renderSelectedModule()}
        </div>
      </Card>
    </div>
  );
};

export default LanguageSettings;
