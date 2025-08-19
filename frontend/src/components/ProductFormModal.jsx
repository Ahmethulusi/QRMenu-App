import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, message, InputNumber, Col, Row, Select, Radio, AutoComplete, Tabs, Divider, Tooltip } from 'antd';
import { PlusOutlined, UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import CategorySelector from './CategorySelector';
import LabelSelector from './LabelSelector';
// import '../css/CategoryFormModal.css';
const API_URL = import.meta.env.VITE_API_URL;
const { TabPane } = Tabs;
const ModalForm = ({ visible, onCancel, onOk}) => {
  const [form] = Form.useForm(); // Form kontrolü
  const [file, setFile] = useState();
  const [status, setStatus] = useState('true');
  const [showcase, setShowcase] = useState('false');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Ürünleri çek
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Ürünler yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setProducts(data.map(product => product.product_name));
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
      message.error('Ürünler yüklenirken bir hata oluştu');
    }
  };

  // İsim değiştiğinde kontrol et
  const handleNameChange = (value) => {
    setSearchValue(value);
    const exists = products.some(product => 
      product.toLowerCase() === value.toLowerCase()
    );
    
    if (exists) {
      form.setFields([
        {
          name: 'name',
          errors: ['Bu isimde bir ürün zaten mevcut!']
        }
      ]);
    }
  };

  // Resim silme fonksiyonu
  const handleRemove = () => {
    setFile(null); // Yüklenen dosyayı sıfırlıyoruz
  };

  const onCancel_handler = () => {
    form.resetFields();
    setFile(null);
    setSelectedLabels([]);
    setSearchValue('');
    onCancel();
  };



  // Resim yükleme değişikliği olduğunda çalışır
  const handleUpload = ({ file }) => setFile(file);

  // Form submit edildiğinde çağrılan fonksiyon
  const handleOk = async () => {
    try {
      setLoading(true);
      
      // Form verilerini al
      const values = await form.validateFields();
      console.log('✅ Form validation başarılı:', values);
  
      const formData = new FormData();
      formData.append('resim', file);
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('category_id', values.category);
      formData.append('price', values.price);
      formData.append('status', status === 'true');
      formData.append('showcase', showcase === 'true');
      
      // Stok bilgisi
      if (values.stock) {
        formData.append('stock', values.stock);
      }
      
      // Kalori ve pişirme süresi
      if (values.calorie_count) {
        formData.append('calorie_count', values.calorie_count);
      }
      
      if (values.cooking_time) {
        formData.append('cooking_time', values.cooking_time);
      }
      
      // Makro besinler
      if (values.carbs) {
        formData.append('carbs', values.carbs);
      }
      
      if (values.protein) {
        formData.append('protein', values.protein);
      }
      
      if (values.fat) {
        formData.append('fat', values.fat);
      }
      
      // Alerjenler
      if (values.allergens) {
        formData.append('allergens', values.allergens);
      }
      
      // Yanında iyi gider önerileri
      if (recommendedProducts && recommendedProducts.length > 0) {
        formData.append('recommended_with', JSON.stringify(recommendedProducts));
      }
      
      // Etiketleri ekle
      if (selectedLabels && selectedLabels.length > 0) {
        formData.append('labels', JSON.stringify(selectedLabels));
      }
      
      // Backend'e veri gönderme
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/products/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ürün oluşturulurken bir hata oluştu');
      }
  
      message.success('Ürün başarıyla oluşturuldu!');
      form.resetFields();  // Formu sıfırla
      setFile(null);
      setSelectedLabels([]);
      setSearchValue('');
      setRecommendedProducts([]);
      onOk();
    } catch (error) {
      console.error('❌ Form hatası:', error);
      
      // Validation hatası ise detayları göster
      if (error.errorFields) {
        console.log('❌ Validation hataları:', error.errorFields);
        error.errorFields.forEach(field => {
          console.log(`❌ Field: ${field.name}, Errors:`, field.errors);
        });
        message.error('Form alanlarını kontrol edin!');
      } else {
        message.error(error.message || 'Bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };
  


  // Önerilen ürünleri seçme fonksiyonu
  const handleRecommendedProductsChange = (selectedProductIds) => {
    setRecommendedProducts(selectedProductIds);
  };

  return (
    <Modal
    title="Ürün Oluştur"
    open={visible}
    onOk={handleOk}
    onCancel={onCancel_handler}
    okText="Oluştur"
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
          {/* İsim */}
          <Form.Item
            label="İsim"
            name="name"
            rules={[
              { required: true, message: 'Lütfen ürün adını giriniz!' },
              () => ({
                validator(_, value) {
                  if (!value || !products.some(product => product.toLowerCase() === value.toLowerCase())) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Bu isimde bir ürün zaten mevcut!'));
                },
              }),
            ]}
          >
            <AutoComplete
              placeholder="Ürün adını girin"
              onChange={handleNameChange}
              value={searchValue}
              options={searchValue ? products
                .filter(product => 
                  product.toLowerCase().includes(searchValue.toLowerCase())
                )
                .map(product => ({ value: product }))
                : []
              }
              filterOption={(inputValue, option) =>
                option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
              }
            />
          </Form.Item>

          {/* Açıklama */}
          <Form.Item
            label="Açıklama"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Ürün açıklaması girin" />
          </Form.Item>



          {/* Kategori */}
          <Form.Item
            label="Kategori"
            name="category"
            rules={[{ required: true, message: 'Lütfen kategori seçiniz!' }]}
          >
            <CategorySelector/>
          </Form.Item>

          {/* Grid Sistemi: Fiyat ve Stok */}
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
              {/* Resim Yükleme */}
              <Form.Item label="Resim Yükle" name="upload">
                {file ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={URL.createObjectURL(file)} alt="Ürün görseli" style={{ width:'120px', height:'120px', objectFit: 'cover', borderRadius: '4px' }} />
                    <Button type="primary" onClick={handleRemove} style={{ marginTop: '10px' }}>Resimi Kaldır</Button>
                  </div>
                ) : (
                  <Upload
                    accept="image/*"
                    beforeUpload={() => false}
                    onChange={info => handleUpload(info)}
                    showUploadList={false}
                  >
                    <Button style={{ width:'120px', height:'120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} icon={<PlusOutlined />}>
                      <div style={{ marginTop: '8px' }}>Resim Yükle</div>
                    </Button>
                  </Upload>
                )}
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
          >
            {
                  <span>
                    Etiketler
                    <Tooltip title="Ürün özelliklerini belirten etiketleri seçebilirsiniz (Vejetaryen, Glutensiz, vb.)">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                }
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
            name="recommended_with"
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
              {products.map((product, index) => (
                <Select.Option key={index} value={index}>{product}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </TabPane>
    </Tabs>
  </Modal>
  );
};

export default ModalForm;
