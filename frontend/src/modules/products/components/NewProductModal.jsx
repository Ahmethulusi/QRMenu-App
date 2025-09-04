import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Upload, message, InputNumber, Col, Row, Select, Tabs, Divider, Tooltip } from 'antd';
import { PlusOutlined, InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import CategoryModal from '../../categories/components/NewCategoryModal';
import PortionManager from './PortionManager';
import '../css/productModal.css';

const API_URL = import.meta.env.VITE_API_URL;
const { TabPane } = Tabs;

const ProductModal = ({ show, handleClose, handleSave }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('Dosya Seçilmedi');
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [portions, setPortions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/categories`);
      if (!response.ok) {
        throw new Error('Kategorileri çekmede bir hata oluştu');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Kategoriler alınamadı', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const formData = new FormData();
      formData.append('productName', values.productName);
      formData.append('description', values.description || '');
      formData.append('price', values.price);
      formData.append('category_id', values.category_id);
      
      if (file) {
        formData.append('resim', file);
      }
      
      // Besin değerleri ve detayları ekle (varsa)
      if (values.calorie_count) formData.append('calorie_count', values.calorie_count);
      if (values.cooking_time) formData.append('cooking_time', values.cooking_time);
      if (values.carbs) formData.append('carbs', values.carbs);
      if (values.protein) formData.append('protein', values.protein);
      if (values.fat) formData.append('fat', values.fat);
      if (values.allergens) formData.append('allergens', values.allergens);
      if (values.stock) formData.append('stock', values.stock);
      
      const response = await fetch(`${API_URL}/api/admin/products/create`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ürün eklenirken bir hata oluştu');
      }

      const newProduct = await response.json();
      
      // Eğer porsiyonlar varsa, bunları da ekle
      if (portions.length > 0) {
        const token = localStorage.getItem('token');
        
        for (const portion of portions) {
          await fetch(`${API_URL}/api/portions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              product_id: newProduct.product_id,
              name: portion.name,
              quantity: portion.quantity,
              price: portion.price
            })
          });
        }
      }

      message.success('Ürün başarıyla eklendi!');
      form.resetFields();
      setFile(null);
      setFileName('Dosya Seçilmedi');
      setPortions([]);
      setActiveTab('1');
      handleSave();
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      message.error('Ürün eklenemedi, lütfen tekrar deneyin!');
    } finally {
      setLoading(false);
    }
  };

  const fetchLastCategory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/categories/last`);
      if (!response.ok) {
        throw new Error('Kategorileri çekmede bir hata oluştu');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Kategoriler alınamadı', error);
    }
  };

  const handleSaveforPlus = async () => {
    fetchCategories();
    const lastCategory = await fetchLastCategory();
    form.setFieldsValue({ category_id: lastCategory.category_id });
    setShowCategoryModal(false);
  };

  const handleModalClose = () => {
    form.resetFields();
    setFile(null);
    setFileName('Dosya Seçilmedi');
    setPortions([]);
    setActiveTab('1');
    handleClose();
  };

  const handleFileChange = (info) => {
    if (info.file) {
      setFile(info.file.originFileObj);
      setFileName(info.file.name || 'Dosya Seçildi');
    } else {
      setFile(null);
      setFileName('Dosya Seçilmedi');
    }
  };

  const handlePortionsChange = (newPortions) => {
    setPortions(newPortions);
  };

  return (
    <Modal
      title="Yeni Ürün Ekle"
      open={show}
      onCancel={handleModalClose}
      onOk={handleSubmit}
      okText="Kaydet"
      cancelText="İptal"
      width={700}
      confirmLoading={loading}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: '75vh', 
          overflowY: 'auto',
          padding: '20px'
        }
      }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Temel Bilgiler" key="1">
          <Form form={form} layout="vertical">
            <Form.Item
              label="Ürün Adı"
              name="productName"
              rules={[{ required: true, message: 'Lütfen ürün adını girin!' }]}
            >
              <Input placeholder="Ürün adını girin" />
            </Form.Item>

            <Form.Item
              label="Açıklama"
              name="description"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Ürün açıklaması girin" 
                style={{
                  textAlign: "left",
                  verticalAlign: "top",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "break-word",
                }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Fiyat"
                  name="price"
                  rules={[{ required: true, message: 'Lütfen fiyat girin!' }]}
                >
                  <InputNumber placeholder="Fiyat" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Stok"
                  name="stock"
                >
                  <InputNumber placeholder="Stok miktarı" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Kategori"
              name="category_id"
              rules={[{ required: true, message: 'Lütfen kategori seçin!' }]}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Select
                  placeholder="Kategori seçin"
                  style={{ flex: 1 }}
                >
                  {categories.map(cat => (
                    <Select.Option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </Select.Option>
                  ))}
                </Select>
                <Button 
                  type="primary" 
                  style={{ marginLeft: 8 }}
                  onClick={() => setShowCategoryModal(true)}
                  icon={<FontAwesomeIcon icon={faPlus} />}
                />
              </div>
            </Form.Item>

            <Form.Item
              label="Resim"
              name="resim"
            >
              <Upload
                beforeUpload={() => false}
                onChange={handleFileChange}
                showUploadList={false}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Dosya Seç</Button>
                <span style={{ marginLeft: 8 }}>{fileName}</span>
              </Upload>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="Besin Değerleri ve Detaylar" key="2">
          <Form form={form} layout="vertical">
            <Divider orientation="left" orientationMargin={0}>Besin Değerleri</Divider>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span>
                      Kalori Miktarı
                      <Tooltip title="Ürünün kalori değeri (kcal)">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                      </Tooltip>
                    </span>
                  }
                  name="calorie_count"
                >
                  <InputNumber placeholder="Kalori (kcal)" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label={
                    <span>
                      Pişirme Süresi
                      <Tooltip title="Ürünün hazırlanma süresi (dakika)">
                        <InfoCircleOutlined style={{ marginLeft: 8 }} />
                      </Tooltip>
                    </span>
                  }
                  name="cooking_time"
                >
                  <InputNumber placeholder="Dakika" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            
            <Divider orientation="left" orientationMargin={0}>Makro Besinler</Divider>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Karbonhidrat (g)"
                  name="carbs"
                >
                  <InputNumber placeholder="Karbonhidrat miktarı" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item
                  label="Protein (g)"
                  name="protein"
                >
                  <InputNumber placeholder="Protein miktarı" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item
                  label="Yağ (g)"
                  name="fat"
                >
                  <InputNumber placeholder="Yağ miktarı" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              label={
                <span>
                  Alerjenler
                  <Tooltip title="Ürünün içerdiği alerjenler (gluten, süt, fındık, vb.)">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </span>
              }
              name="allergens"
            >
              <Input.TextArea rows={2} placeholder="Alerjen bilgilerini girin (örn: gluten, süt, fındık)" />
            </Form.Item>
          </Form>
        </TabPane>
        
        <TabPane tab="Porsiyonlar" key="3">
          {/* Porsiyon Yönetimi */}
          <PortionManager onPortionsChange={handlePortionsChange} />
        </TabPane>
      </Tabs>

      <CategoryModal
        show={showCategoryModal}
        handleClose={() => setShowCategoryModal(false)}
        handleSave={handleSaveforPlus}
      />
    </Modal>
  );
};

export default ProductModal;