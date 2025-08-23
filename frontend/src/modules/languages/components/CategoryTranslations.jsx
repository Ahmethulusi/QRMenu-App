import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, message, Card, Tag, Modal, Form, Tooltip } from 'antd';
import { EditOutlined, PlusOutlined, RobotOutlined } from '@ant-design/icons';
import { apiGet, apiPost, apiPut } from '../../../utils/api';
import { useLanguage } from '../../../contexts/LanguageContext';

const { Search } = Input;

const CategoryTranslations = ({ currentLanguage, onSuccess, onError }) => {
  const { defaultLanguage } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [translationModal, setTranslationModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [translationForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [aiTranslating, setAiTranslating] = useState({});

  useEffect(() => {
    if (currentLanguage) {
      fetchCategories();
      fetchTranslations();
    }
  }, [currentLanguage]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/admin/categories', currentLanguage.code);
      setCategories(response || []);
    } catch (error) {
      console.error('Kategoriler getirilemedi:', error);
      onError('Kategoriler getirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchTranslations = async () => {
    try {
      console.log('🔄 Kategori çevirileri getiriliyor, dil:', currentLanguage.code);
      const response = await apiGet('/api/translations/categories', currentLanguage.code);
      console.log('✅ Kategori çevirileri alındı:', response);
      setTranslations(response || []);
    } catch (error) {
      console.error('Çeviriler getirilemedi:', error);
      setTranslations([]);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredCategories = categories.filter(category =>
    category.category_name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const getTranslationStatus = (categoryId) => {
    // Mevcut dil için çeviri var mı kontrol et
    const translation = translations.find(t => 
      t.category_id === categoryId && 
      t.language_code === currentLanguage.code
    );
    
    if (translation) {
      return <Tag color="green">Çevrildi</Tag>;
    }
    return <Tag color="orange">Çevrilmedi</Tag>;
  };

  // AI ile otomatik çeviri
  const handleAITranslation = async (category) => {
    try {
      console.log('🚀 Kategori AI çeviri başlatılıyor...', category);
      setAiTranslating(prev => ({ ...prev, [category.category_id]: true }));
      setSelectedCategory(category);
      
      // DeepL API ile çeviri yap
      const translatedData = await translateCategoryWithAI(category);
      
      // Form'u çevirilerle doldur
      translationForm.setFieldsValue({
        category_name: translatedData.category_name
      });
      
      setTranslationModal(true);
      message.success('AI çevirisi tamamlandı! Gerekirse düzenleyip kaydedin.');
      
    } catch (error) {
      console.error('AI çeviri hatası:', error);
      message.error('AI çevirisi başarısız. Manuel çeviri yapabilirsiniz.');
      
      // Hata durumunda normal çeviri modal'ını aç
      handleEditTranslation(category);
    } finally {
      setAiTranslating(prev => ({ ...prev, [category.category_id]: false }));
    }
  };

  // AI çeviri fonksiyonu (Backend API)
  const translateCategoryWithAI = async (category) => {
    const sourceLang = defaultLanguage?.code || 'tr';
    const targetLang = currentLanguage.code;
    
    if (sourceLang === targetLang) {
      return {
        category_name: category.category_name
      };
    }

    try {
      console.log('📡 Frontend: DeepL API isteği gönderiliyor...');
      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('📋 İstek detayları:', {
        url: '/api/translations/translate',
        method: 'POST',
        sourceLang,
        targetLang,
        text: category.category_name,
        token: localStorage.getItem('token') ? 'Mevcut' : 'Eksik'
      });
      
      // Backend DeepL API'sine çeviri isteği gönder
      const response = await fetch('/api/translations/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          texts: [category.category_name || ''],
          sourceLang: sourceLang,
          targetLang: targetLang
        })
      });

      console.log('📥 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Hatası:', response.status, errorText);
        throw new Error(`Translation API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 DeepL API verisi (kategori):', data);
      
      if (!data.success || !data.translations) {
        throw new Error('Invalid DeepL response format');
      }
      
      const translation = data.translations[0];
      console.log('🔄 Kategori çeviri sonucu:', translation);

      return {
        category_name: translation?.translatedText || category.category_name || ''
      };
    } catch (error) {
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
        category_name: `[${targetLang.toUpperCase()}] ${category.category_name}`
      };
    }
  };

  const handleEditTranslation = (category) => {
    setSelectedCategory(category);
    const existingTranslation = translations.find(t => t.category_id === category.category_id);
    
    if (existingTranslation) {
      translationForm.setFieldsValue({
        category_name: existingTranslation.category_name
      });
    } else {
      translationForm.setFieldsValue({
        category_name: ''
      });
    }
    
    setTranslationModal(true);
  };

  const handleSaveTranslation = async () => {
    try {
      const values = await translationForm.validateFields();
      setSaving(true);
      
      const translationData = {
        category_id: selectedCategory.category_id,
        language_code: currentLanguage.code,
        ...values
      };
      
      const existingTranslation = translations.find(t => t.category_id === selectedCategory.category_id);
      
      let response;
      if (existingTranslation) {
        response = await apiPut('/api/translations/categories', translationData);
        message.success('Çeviri güncellendi');
      } else {
        response = await apiPost('/api/translations/categories', translationData);
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
      title: 'Kategori ID',
      dataIndex: 'category_id',
      key: 'category_id',
      width: 100,
    },
    {
      title: 'Kategori Adı',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 250,
    },
    {
      title: 'Sıra ID',
      dataIndex: 'sira_id',
      key: 'sira_id',
      width: 80,
    },
    {
      title: 'Çeviri Durumu',
      key: 'translation_status',
      width: 120,
      render: (_, record) => getTranslationStatus(record.category_id),
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
              loading={aiTranslating[record.category_id]}
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
      <Card title="Kategori Çevirileri" className="translations-card">
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Kategori ara..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => message.info('Toplu çeviri yakında eklenecek')}
            >
              Toplu Çeviri
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="category_id"
          loading={loading}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} kategori`,
          }}
          scroll={{ x: 800, y: 600 }}
          bordered={false}
          size="small"
        />
      </Card>

      {/* Çeviri Modal'ı */}
      <Modal
        title={`${selectedCategory?.category_name} - ${currentLanguage?.native_name} Çevirisi`}
        open={translationModal}
        onOk={handleSaveTranslation}
        onCancel={() => setTranslationModal(false)}
        confirmLoading={saving}
        width={500}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form
          form={translationForm}
          layout="vertical"
          initialValues={{
            category_name: ''
          }}
        >
          <Form.Item
            label="Kategori Adı"
            name="category_name"
            rules={[{ required: true, message: 'Kategori adı gerekli!' }]}
          >
            <Input placeholder={`${currentLanguage?.native_name} kategori adı`} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CategoryTranslations;