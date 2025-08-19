import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, message, InputNumber, Col, Row, Select, Radio, Tabs, Divider, Tooltip } from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import CategorySelector from './CategorySelector';
import LabelSelector from './LabelSelector';

const API_URL = import.meta.env.VITE_API_URL;
const { TabPane } = Tabs;

const EditModal = ({ visible, onCancel, onOk, record }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('true');
  const [showcase, setShowcase] = useState('false');
  const [loading, setLoading] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Önerilen ürünler için basit veri çek
  useEffect(() => {
    const fetchRecommendedProductsData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/products/recommended-data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Önerilen ürün verileri yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error('Önerilen ürün verileri yüklenemedi:', error);
        message.error('Önerilen ürün verileri yüklenirken bir hata oluştu');
      }
    };
    
    fetchRecommendedProductsData();
  }, []);

  // Record değiştiğinde form alanlarını doldur
  useEffect(() => {
    if (record) {
      console.log("Setting form values:", record); // Debug için
      form.setFieldsValue({
        name: record.product_name,
        description: record.description,
        price: record.price,
        category: record.category_id,
        stock: record.stock,
        calorie_count: record.calorie_count,
        cooking_time: record.cooking_time,
        carbs: record.carbs,
        protein: record.protein,
        fat: record.fat,
        allergens: record.allergens,
        status: record.is_available ? 'true' : 'false',
        showcase: record.is_selected ? 'true' : 'false'
      });
      setStatus(record.is_available ? 'true' : 'false');
      setShowcase(record.is_selected ? 'true' : 'false');
      setImageRemoved(false);
      
      // Etiketleri ayarla
      if (record.labels && Array.isArray(record.labels)) {
        setSelectedLabels(record.labels.map(label => label.label_id));
        console.log('✅ EditModal - Etiketler yüklendi:', record.labels);
      } else {
        setSelectedLabels([]);
      }
      
      // Önerilen ürünleri ayarla
      if (record.recommended_with) {
        try {
          const recommendedIds = JSON.parse(record.recommended_with);
          setRecommendedProducts(recommendedIds);
        } catch (e) {
          console.error('Önerilen ürünler parse hatası:', e);
          setRecommendedProducts([]);
        }
      } else {
        setRecommendedProducts([]);
      }
      
      // Eğer resim varsa göster
      if (record.image_url) {
        // Backend'den filename olarak geldiği için tam URL oluştur
        const imageUrl = record.image_url.startsWith('http') 
          ? record.image_url 
          : `${API_URL}/images/${record.image_url}`;
        setFile({ preview: imageUrl });
      } else {
        setFile(null);
      }
    }
  }, [record, form]);

  const handleRemove = () => {
    setFile(null);
    setImageRemoved(true);
  };

  const onCancel_handler = () => {
    form.resetFields();
    setFile(null);
    setImageRemoved(false);
    setSelectedLabels([]);
    onCancel();
  };

  const handleUpload = ({ file }) => {
    setFile({
      file,
      preview: URL.createObjectURL(file)
    });
    setImageRemoved(false);
  };

  // Önerilen ürünleri seçme fonksiyonu
  const handleRecommendedProductsChange = (selectedProductIds) => {
    setRecommendedProducts(selectedProductIds);
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (!values.category) {
        message.error('Lütfen bir kategori seçin!');
        return;
      }

      const token = localStorage.getItem('token');

      // Önce ürün bilgilerini güncelle
      const productResponse = await fetch(`${API_URL}/api/admin/products/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: record.product_id,
          newName: values.name,
          newPrice: values.price,
          newDescription: values.description,
          newCategory_id: parseInt(values.category),
          stock: values.stock,
          calorie_count: values.calorie_count,
          cooking_time: values.cooking_time,
          carbs: values.carbs,
          protein: values.protein,
          fat: values.fat,
          allergens: values.allergens,
          recommended_with: recommendedProducts.length > 0 ? JSON.stringify(recommendedProducts) : null,
          status: status === 'true',
          showcase: showcase === 'true',
          labels: selectedLabels // Etiketleri ekle
        }),
      });

      if (!productResponse.ok) {
        throw new Error('Ürün güncellenirken bir hata oluştu');
      }

      // Sonra resim güncellemesi yap
      const formData = new FormData();
      formData.append('product_id', record.product_id);
      
      if (imageRemoved) {
        formData.append('removeImage', 'true');
      } else if (file && file.file) {
        formData.append('resim', file.file);
      }

      // Sadece resim değişikliği varsa resim güncelleme isteği gönder
      if (imageRemoved || (file && file.file)) {
        const imageResponse = await fetch(`${API_URL}/api/admin/products/updateImage`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (!imageResponse.ok) {
          throw new Error('Resim güncellenirken bir hata oluştu');
        }
      }

      message.success('Ürün başarıyla güncellendi!');
      onCancel();
      onOk();
    } catch (error) {
      console.error(error);
      message.error('Ürün güncellenemedi, lütfen tekrar deneyin!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Ürün Düzenle"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel_handler}
      okText="Güncelle"
      cancelText="İptal"
      padding={0}
      width={600}
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
              label="İsim"
              name="name"
              rules={[{ required: true, message: 'Lütfen isim giriniz!' }]}
            >
              <Input placeholder="İsim girin" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Açıklama"
                  name="description"
                >
                  <Input.TextArea rows={3} placeholder="Açıklama girin" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Kategori"
                  name="category"
                  rules={[{ required: true, message: 'Lütfen kategori seçiniz!' }]}
                >
                  <CategorySelector 
                    selectedCategoryId={record?.category_id}
                    onCategoryChange={(categoryId) => {
                      form.setFieldsValue({ category: categoryId });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>



            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  label="Fiyat"
                  name="price"
                  rules={[{ required: true, message: 'Lütfen fiyat giriniz!' }]}
                >
                  <InputNumber placeholder="Fiyat girin" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Stok"
                  name="stock"
                >
                  <InputNumber placeholder="Stok girin" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={20}>
              <Col span={12}>
                <Form.Item label="Resim Yükle" name="upload">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {file ? (
                      <>
                        <img 
                          src={file.preview} 
                          style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '4px' }} 
                          alt="Product"
                        />
                        <Button type="primary" onClick={handleRemove} style={{ marginTop: '10px' }}>
                          Resimi Kaldır
                        </Button>
                      </>
                    ) : (
                      <Upload
                        accept="image/*"
                        beforeUpload={() => false}
                        onChange={info => handleUpload(info)}
                        showUploadList={false}
                      >
                        <Button style={{ width: '120px', height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} icon={<PlusOutlined />}>
                          <div style={{ marginTop: '8px' }}>Resim Yükle</div>
                        </Button>
                      </Upload>
                    )}
                  </div>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Durum"
                  name="status"
                  rules={[{ required: true, message: 'Lütfen durum seçiniz!' }]}
                >
                  <Radio.Group onChange={(e) => setStatus(e.target.value)} value={status}>
                    <Radio value="true">Aktif</Radio>
                    <Radio value="false">Pasif</Radio>
                  </Radio.Group>
                </Form.Item>
                
                <Form.Item
                  label="Vitrin"
                  name="showcase"
                  rules={[{ required: true, message: 'Lütfen vitrin seçiniz!' }]}
                >
                  <Radio.Group onChange={(e) => setShowcase(e.target.value)} value={showcase}>
                    <Radio value="true">Evet</Radio>
                    <Radio value="false">Hayır</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </TabPane>
        
        <TabPane tab="Besin Değerleri ve Detaylar" key="2">
          <Form form={form} layout="vertical">
            {/* Etiketler */}
            <Form.Item
              label="Etiketler"
              help="Ürün özelliklerini belirten etiketleri seçebilirsiniz (Vejetaryen, Glutensiz, vb.)"
            >
              <LabelSelector
                value={selectedLabels}
                onChange={setSelectedLabels}
                placeholder="Etiket seçiniz veya yeni etiket oluşturun..."
              />
            </Form.Item>
            
            <Divider orientation="left" orientationMargin={0}>Besin Değerleri</Divider>
            
            <Row gutter={20}>
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
            
            <Row gutter={20}>
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
            
            <Form.Item
              label={
                <span>
                  Yanında İyi Gider
                  <Tooltip title="Bu ürünle birlikte sunulabilecek veya iyi gidecek diğer ürünler">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </span>
              }
            >
              <Select
                mode="multiple"
                placeholder="Önerilen ürünleri seçin"
                style={{ width: '100%' }}
                onChange={handleRecommendedProductsChange}
                value={recommendedProducts}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {allProducts.map((product) => (
                  <Select.Option key={product.product_id} value={product.product_id}>
                    {product.product_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default EditModal;
