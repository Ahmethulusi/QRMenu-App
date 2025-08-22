import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, message, Card, Tag, Modal, Form } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { apiGet, apiPost, apiPut } from '../../../utils/api';

const { Search } = Input;

const CategoryTranslations = ({ currentLanguage, onSuccess, onError }) => {
  const [categories, setCategories] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [translationModal, setTranslationModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [translationForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditTranslation(record)}
          >
            Çeviri
          </Button>
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
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} kategori`,
          }}
          scroll={{ x: 800 }}
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