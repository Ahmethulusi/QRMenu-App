import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, message, Card, Tag, Modal, Form, Tooltip } from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined, RobotOutlined } from '@ant-design/icons';
import { apiGet, apiPost, apiPut } from '../../../utils/api';
import { useLanguage } from '../../../contexts/LanguageContext';
// import '../../tables_and_QR/css/tableSizeManager.css';

import '../css/LanguageSettings.css';

const { Search } = Input;

const ProductTranslations = ({ currentLanguage, onSuccess, onError }) => {
  const { defaultLanguage } = useLanguage();
  const [products, setProducts] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [translationModal, setTranslationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [translationForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [aiTranslating, setAiTranslating] = useState({});

  useEffect(() => {
    if (currentLanguage) {
      fetchProducts();
      fetchTranslations();
    }
  }, [currentLanguage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/admin/products', currentLanguage.code);
      setProducts(response || []);
    } catch (error) {
      console.error('Ürünler getirilemedi:', error);
      onError('Ürünler getirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchTranslations = async () => {
    try {
      console.log('🔄 Çeviriler getiriliyor, dil:', currentLanguage.code);
      const response = await apiGet('/api/translations/products', currentLanguage.code);
      console.log('✅ Çeviriler alındı:', response);
      setTranslations(response || []);
    } catch (error) {
      console.error('Çeviriler getirilemedi:', error);
      setTranslations([]);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredProducts = products.filter(product =>
    product.product_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const getTranslationStatus = (productId) => {
    // Mevcut dil için çeviri var mı kontrol et
    const translation = translations.find(t => 
      t.product_id === productId && 
      t.language_code === currentLanguage.code
    );
    
    if (translation) {
      return <Tag color="green">Çevrildi</Tag>;
    }
    return <Tag color="orange">Çevrilmedi</Tag>;
  };

  // AI ile otomatik çeviri
  const handleAITranslation = async (product) => {
    try {
      console.log('🚀 AI çeviri başlatılıyor...', product);
      setAiTranslating(prev => ({ ...prev, [product.product_id]: true }));
      setSelectedProduct(product);
      
      // DeepL API kullanarak çeviri yap
      const translatedData = await translateWithAI(product);
      console.log('✅ AI çeviri tamamlandı:', translatedData);
      
      // Form'u çevirilerle doldur
      translationForm.setFieldsValue({
        product_name: translatedData.product_name,
        description: translatedData.description,
        allergens: translatedData.allergens
      });
      
      setTranslationModal(true);
      message.success('AI çevirisi tamamlandı! Gerekirse düzenleyip kaydedin.');
      
    } catch (error) {
      console.error('AI çeviri hatası:', error);
      message.error('AI çevirisi başarısız. Manuel çeviri yapabilirsiniz.');
      
      // Hata durumunda normal çeviri modal'ını aç
      handleEditTranslation(product);
    } finally {
      setAiTranslating(prev => ({ ...prev, [product.product_id]: false }));
    }
  };

  // AI çeviri fonksiyonu (Backend API)
  const translateWithAI = async (product) => {
    const sourceLang = defaultLanguage?.code || 'tr'; // Dinamik kaynak dil
    const targetLang = currentLanguage.code;
    
    console.log('🌍 Çeviri parametreleri:', { sourceLang, targetLang, product });
    
    // Eğer aynı dil ise çeviri yapmaya gerek yok
    if (sourceLang === targetLang) {
      console.log('✅ Aynı dil, çeviri yapılmadı');
      return {
        product_name: product.product_name,
        description: product.description,
        allergens: product.allergens
      };
    }

    try {
      console.log('📡 Frontend: DeepL API isteği gönderiliyor...');
      console.log('📋 İstek detayları:', {
        url: '/api/translations/translate',
        method: 'POST',
        sourceLang,
        targetLang,
        texts: [
          product.product_name || '',
          product.description || '',
          product.allergens || ''
        ],
        token: localStorage.getItem('token') ? 'Mevcut' : 'Eksik'
      });
      
      // Backend DeepL API'sine çeviri isteği gönder
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_BASE_URL}/api/translations/translate`, {
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
          sourceLang: sourceLang,
          targetLang: targetLang
        })
      });

      console.log('📥 Response status:', response.status, response.statusText);
      
      // Geçici olarak response body'yi kontrol et
      const responseText = await response.text();
      console.log('📋 Response body (raw):', responseText);
      
      if (!response.ok) {
        console.error('❌ API Hatası:', response.status, responseText);
        throw new Error(`Translation API error: ${response.status} - ${responseText}`);
      }

      // Response body'yi parse et
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Hatası:', parseError);
        throw new Error('Invalid JSON response');
      }
      
      console.log('📋 DeepL API verisi:', data);
      
      if (!data.success || !data.translations) {
        throw new Error('Invalid DeepL response format');
      }
      
      const translations = data.translations;
      console.log('🔄 Çeviri sonuçları:', translations);

      return {
        product_name: translations[0]?.translatedText || product.product_name || '',
        description: translations[1]?.translatedText || product.description || '',
        allergens: translations[2]?.translatedText || product.allergens || ''
      };
    } catch (error) {
      // API hatası durumunda basit çeviri önerisi
      console.warn('DeepL API failed, using fallback:', error);
      
      // Hata detaylarını logla
      if (error.message.includes('401')) {
        console.error('❌ DeepL API key hatası - Yetkilendirme başarısız');
      } else if (error.message.includes('429')) {
        console.error('❌ DeepL API rate limit - Çok fazla istek');
      } else if (error.message.includes('500')) {
        console.error('❌ DeepL API sunucu hatası');
      }
      
      return {
        product_name: `[${targetLang.toUpperCase()}] ${product.product_name}`,
        description: `[${targetLang.toUpperCase()}] ${product.description}`,
        allergens: `[${targetLang.toUpperCase()}] ${product.allergens}`
      };
    }
  };

  const handleEditTranslation = (product) => {
    setSelectedProduct(product);
    const existingTranslation = translations.find(t => 
      t.product_id === product.product_id && 
      t.language_code === currentLanguage.code
    );
    
    if (existingTranslation) {
      translationForm.setFieldsValue({
        product_name: existingTranslation.product_name,
        description: existingTranslation.description,
        allergens: existingTranslation.allergens
      });
    } else {
      translationForm.setFieldsValue({
        product_name: '',
        description: '',
        allergens: ''
      });
    }
    
    setTranslationModal(true);
  };

  const handleSaveTranslation = async () => {
    try {
      const values = await translationForm.validateFields();
      setSaving(true);
      
      const translationData = {
        product_id: selectedProduct.product_id,
        language_code: currentLanguage.code,
        ...values
      };
      
      const existingTranslation = translations.find(t => 
        t.product_id === selectedProduct.product_id && 
        t.language_code === currentLanguage.code
      );
      
      let response;
      if (existingTranslation) {
        response = await apiPut('/api/translations/products', translationData);
        message.success('Çeviri güncellendi');
      } else {
        response = await apiPost('/api/translations/products', translationData);
        message.success('Çeviri eklendi');
      }
      
      setTranslationModal(false);
      fetchTranslations();
      onSuccess && onSuccess();
      
    } catch (error) {
      console.error('Çeviri kaydedilemedi:', error);
      message.error('Çeviri kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
   
    {
      title: 'Ürün Adı (Orijinal)',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
    },
    {
      title: 'Ürün Adı (Çeviri)',
      key: 'translated_name',
      width: 200,
      render: (_, record) => {
        const translation = translations.find(t => 
          t.product_id === record.product_id && 
          t.language_code === currentLanguage.code
        );
        return translation?.product_name || '-';
      },
    },
    {
      title: 'Açıklama (Orijinal)',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Açıklama (Çeviri)',
      key: 'translated_description',
      width: 250,
      ellipsis: true,
      render: (_, record) => {
        const translation = translations.find(t => 
          t.product_id === record.product_id && 
          t.language_code === currentLanguage.code
        );
        return translation?.description || '-';
      },
    },
    {
      title: 'Allerjenler (Orijinal)',
      dataIndex: 'allergens',
      key: 'allergens',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Allerjenler (Çeviri)',
      key: 'translated_allergens',
      width: 180,
      ellipsis: true,
      render: (_, record) => {
        const translation = translations.find(t => 
          t.product_id === record.product_id && 
          t.language_code === currentLanguage.code
        );
        return translation?.allergens || '-';
      },
    },
    {
      title: 'Çeviri Durumu',
      key: 'translation_status',
      width: 120,
      render: (_, record) => getTranslationStatus(record.product_id),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="AI ile Otomatik Çeviri">
            <Button 
              type="primary" 
              size="small" 
              icon={<RobotOutlined />}
              onClick={() => handleAITranslation(record)}
              loading={aiTranslating[record.product_id]}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              AI Çeviri
            </Button>
          </Tooltip>
          <Tooltip title="Manuel Çeviri">
            <Button 
              type="default" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditTranslation(record)}
            >
              Manuel
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* Başlık ve veri sayısı - Product_Table.jsx tarzında */}
      {/* <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        // marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Ürün Çevirileri</h2>
        <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>
          Toplam: {products.length} ürün
        </span>
      </div> */}

      <Table
        className='ant-table'
        columns={columns}
        dataSource={filteredProducts}
        rowKey="product_id"
        loading={loading}
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50'],
          showSizeChanger: true,
          defaultPageSize: 10,
          responsive: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          position: ['bottomRight']
        }}
        scroll={{ x: 1200, y: 500 }}
        bordered={true}
        // sticky={{ offsetHeader: 0 }}
        // virtual={false}
      />

      {/* Çeviri Modal'ı */}
      <Modal
        title={`${selectedProduct?.product_name} - ${currentLanguage?.native_name} Çevirisi`}
        open={translationModal}
        onOk={handleSaveTranslation}
        onCancel={() => setTranslationModal(false)}
        confirmLoading={saving}
        width={600}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form
          form={translationForm}
          layout="vertical"
          initialValues={{
            product_name: '',
            description: '',
            allergens: ''
          }}
        >
          <Form.Item
            label="Ürün Adı"
            name="product_name"
            rules={[{ required: true, message: 'Ürün adı gerekli!' }]}
          >
            <Input placeholder={`${currentLanguage?.native_name} ürün adı`} />
          </Form.Item>
          
          <Form.Item
            label="Açıklama"
            name="description"
          >
            <Input.TextArea 
              rows={3} 
              placeholder={`${currentLanguage?.native_name} açıklama`}
            />
          </Form.Item>
          
          <Form.Item
            label="Allerjenler"
            name="allergens"
          >
            <Input.TextArea 
              rows={2} 
              placeholder={`${currentLanguage?.native_name} alerjen bilgisi`}
            />
          </Form.Item>
        </Form>
      </Modal>


    </>
  );
};

export default ProductTranslations;

