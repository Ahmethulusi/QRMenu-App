import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, message, Card, Tag, Modal, Form } from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { apiGet, apiPost, apiPut } from '../../../utils/api';

const { Search, TextArea } = Input;

const ProductTranslations = ({ currentLanguage, onSuccess, onError }) => {
  const [products, setProducts] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [translationModal, setTranslationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [translationForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

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

  const handleEditTranslation = (product) => {
    setSelectedProduct(product);
    const existingTranslation = translations.find(t => t.product_id === product.product_id);
    
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
      
      const existingTranslation = translations.find(t => t.product_id === selectedProduct.product_id);
      
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
      title: 'Ürün ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 80,
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Allerjenler',
      dataIndex: 'allergens',
      key: 'allergens',
      width: 200,
      ellipsis: true,
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
      <Card title="Ürün Çevirileri" className="translations-card">
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Ürün ara..."
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
          dataSource={filteredProducts}
          rowKey="product_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} ürün`,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

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
            <TextArea 
              rows={3} 
              placeholder={`${currentLanguage?.native_name} açıklama`}
            />
          </Form.Item>
          
          <Form.Item
            label="Allerjenler"
            name="allergens"
          >
            <TextArea 
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
