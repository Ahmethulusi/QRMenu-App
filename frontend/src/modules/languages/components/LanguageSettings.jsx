import React, { useState, useEffect } from 'react';
import { Card, Select, message, Spin, Space, Button, Modal, Progress } from 'antd';
import { GlobalOutlined, TranslationOutlined, SettingOutlined, RobotOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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
  const { currentLanguage, changeLanguage, loading: languageLoading, defaultLanguage } = useLanguage();
  const [selectedModule, setSelectedModule] = useState('products');
  const [bulkTranslateModal, setBulkTranslateModal] = useState(false);
  const [bulkTranslating, setBulkTranslating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkStatus, setBulkStatus] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Responsive kontrol
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Toplu çeviri başlat
  const handleBulkTranslate = () => {
    if (!currentLanguage || !defaultLanguage) {
      message.error('Dil bilgisi eksik!');
      return;
    }

    if (currentLanguage.code === defaultLanguage.code) {
      message.warning('Aynı dil seçili! Çeviri yapılamaz.');
      return;
    }

    setBulkTranslateModal(true);
  };

  // Toplu çeviri onaylandı
  const confirmBulkTranslate = async () => {
    try {
      setBulkTranslating(true);
      setBulkProgress(0);
      setBulkStatus('Toplu çeviri başlatılıyor...');

      // Ürünleri çevir
      setBulkStatus('Ürünler çevriliyor...');
      await bulkTranslateProducts();
      setBulkProgress(33);

      // Kategorileri çevir
      setBulkStatus('Kategoriler çevriliyor...');
      await bulkTranslateCategories();
      setBulkProgress(66);

      // Diğer modüller için hazırlık
      setBulkStatus('Diğer modüller hazırlanıyor...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBulkProgress(100);

      setBulkStatus('Toplu çeviri tamamlandı!');
      message.success('Toplu çeviri başarıyla tamamlandı!');
      
      // Modal'ı kapat ve sayfayı yenile
      setTimeout(() => {
        setBulkTranslateModal(false);
        setBulkTranslating(false);
        setBulkProgress(0);
        setBulkStatus('');
        // Sayfayı yenile
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Toplu çeviri hatası:', error);
      message.error('Toplu çeviri sırasında hata oluştu!');
      setBulkStatus('Hata oluştu!');
      setBulkTranslating(false);
    }
  };

  // Ürünleri toplu çevir
  const bulkTranslateProducts = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      
      // Önce tüm ürünleri getir
      const productsResponse = await fetch(`${API_BASE_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!productsResponse.ok) {
        throw new Error('Ürünler getirilemedi');
      }
      
      const products = await productsResponse.json();
      
      // Her ürün için çeviri yap
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        // Çeviri yap
        const translationResponse = await fetch(`${API_BASE_URL}/api/translations/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            texts: [
              product.product_name || '',
              product.description || '',
              product.allergens || ''
            ],
            sourceLang: defaultLanguage.code,
            targetLang: currentLanguage.code
          })
        });

        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          
          if (translationData.success && translationData.translations) {
            // Çeviriyi kaydet
            const saveResponse = await fetch(`${API_BASE_URL}/api/translations/products`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                product_id: product.product_id,
                language_code: currentLanguage.code,
                product_name: translationData.translations[0]?.translatedText || product.product_name,
                description: translationData.translations[1]?.translatedText || product.description,
                allergens: translationData.translations[2]?.translatedText || product.allergens
              })
            });

            if (!saveResponse.ok) {
              console.warn(`Ürün ${product.product_id} çevirisi kaydedilemedi`);
            }
          }
        }

        // Progress güncelle
        const progress = Math.round((i + 1) / products.length * 33);
        setBulkProgress(progress);
      }

    } catch (error) {
      console.error('Ürün toplu çeviri hatası:', error);
      throw error;
    }
  };

  // Kategorileri toplu çevir
  const bulkTranslateCategories = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      
      // Önce tüm kategorileri getir
      const categoriesResponse = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!categoriesResponse.ok) {
        throw new Error('Kategoriler getirilemedi');
      }
      
      const categories = await categoriesResponse.json();
      
      // Her kategori için çeviri yap
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        
        // Çeviri yap
        const translationResponse = await fetch(`${API_BASE_URL}/api/translations/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            texts: [category.category_name || ''],
            sourceLang: defaultLanguage.code,
            targetLang: currentLanguage.code
          })
        });

        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          
          if (translationData.success && translationData.translations) {
            // Çeviriyi kaydet
            const saveResponse = await fetch(`${API_BASE_URL}/api/translations/categories`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                category_id: category.category_id,
                language_code: currentLanguage.code,
                category_name: translationData.translations[0]?.translatedText || category.category_name
              })
            });

            if (!saveResponse.ok) {
              console.warn(`Kategori ${category.category_id} çevirisi kaydedilemedi`);
            }
          }
        }

        // Progress güncelle
        const progress = 33 + Math.round((i + 1) / categories.length * 33);
        setBulkProgress(progress);
      }

    } catch (error) {
      console.error('Kategori toplu çeviri hatası:', error);
      throw error;
    }
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
      {/* Kontrol Butonları - Product_Table.jsx tarzında */}
      <div style={{ marginBottom: '20px' }}>
        {isMobile ? (
          /* Mobil Layout - Alt alta */
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            alignItems: 'flex-start',
            maxWidth: '300px'
          }}>
            <LanguageSelector onLanguageChange={handleLanguageChange} showLabel={false} />
            
            <Select
              value={selectedModule}
              onChange={handleModuleChange}
              style={{ width: '100%' }}
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
            
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={handleBulkTranslate}
              style={{ 
                backgroundColor: '#52c41a', 
                borderColor: '#52c41a',
                width: '100%'
              }}
              disabled={!currentLanguage || currentLanguage.code === defaultLanguage?.code}
            >
              Toplu Çeviri
            </Button>
          </div>
        ) : (
          /* Desktop Layout - Yan yana */
          <Space size="large" style={{ width: '100%', justifyContent: 'flex-start' }}>
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
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={handleBulkTranslate}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              disabled={!currentLanguage || currentLanguage.code === defaultLanguage?.code}
            >
              Toplu Çeviri
            </Button>
          </Space>
        )}
      </div>

      {/* Modül İçeriği */}
      <div className="module-content">
        {renderSelectedModule()}
      </div>

      {/* Toplu Çeviri Modal'ı */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RobotOutlined style={{ color: '#52c41a' }} />
            <span>Toplu Çeviri</span>
          </div>
        }
        open={bulkTranslateModal}
        onOk={confirmBulkTranslate}
        onCancel={() => setBulkTranslateModal(false)}
        confirmLoading={bulkTranslating}
        okText="Çeviriyi Başlat"
        cancelText="İptal"
        width={500}
        closable={!bulkTranslating}
        maskClosable={!bulkTranslating}
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <span style={{ fontWeight: 500 }}>Dikkat!</span>
          </div>
          <p>
            Bu işlem <strong>{defaultLanguage?.native_name}</strong> dilindeki tüm içerikleri 
            <strong> {currentLanguage?.native_name}</strong> diline çevirecektir.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Çevrilecek modüller:</strong>
          </p>
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            <li>✅ Ürünler (ürün adı, açıklama, allerjenler)</li>
            <li>✅ Kategoriler (kategori adı)</li>
            <li>⏳ Duyurular (yakında)</li>
            <li>⏳ İşletmeler (yakında)</li>
          </ul>
        </div>

        {bulkTranslating && (
          <div style={{ marginTop: '20px' }}>
            <Progress 
              percent={bulkProgress} 
              status={bulkProgress === 100 ? 'success' : 'active'}
              strokeColor="#52c41a"
            />
            <div style={{ textAlign: 'center', marginTop: '8px', color: '#666' }}>
              {bulkStatus}
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f6ffed', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#52c41a' }}>💡</span>
            <span style={{ fontSize: '13px' }}>
              Çeviriler tamamlandıktan sonra manuel olarak düzenleyebilirsiniz.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LanguageSettings;
