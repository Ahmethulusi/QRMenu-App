import React, { useState, useEffect } from 'react';
import { 
  message, 
  Tabs, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Switch, 
  InputNumber, 
  Button, 
  Radio, 
  Upload, 
  Divider, 
  Card 
} from 'antd';
import { PlusOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { apiPost, apiPut, apiGet } from '../utils/api';
import moment from 'moment';
import '../css/announcementFormModal.css';

const API_URL = import.meta.env.VITE_API_URL;

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const AnnouncementFormModal = ({ announcement, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);
  const [announcementType, setAnnouncementType] = useState('general');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Ürünleri ve kategorileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ürünleri getir
        const productsResponse = await apiGet('/api/admin/products');
        if (productsResponse && Array.isArray(productsResponse)) {
          setProducts(productsResponse.map(product => ({
            value: product.product_id,
            label: product.product_name
          })));
        }

        // Kategorileri getir
        const categoriesResponse = await apiGet('/api/admin/categories');
        if (categoriesResponse && Array.isArray(categoriesResponse)) {
          setCategories(categoriesResponse.map(category => ({
            value: category.category_id,
            label: category.category_name
          })));
        }
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
        message.error('Ürünler ve kategoriler yüklenirken bir hata oluştu.');
      }
    };

    fetchData();
  }, []);

  // Düzenleme durumunda formu doldur
  useEffect(() => {
    if (announcement) {
      console.log("📋 Düzenlenecek duyuru:", announcement);
      
      // Tarih alanlarını moment nesnelerine dönüştür
      const startDate = announcement.start_date ? moment(announcement.start_date) : null;
      const endDate = announcement.end_date ? moment(announcement.end_date) : null;
      
      form.setFieldsValue({
        title: announcement.title,
        type: announcement.type || 'general',
        content: announcement.content,
        priority: announcement.priority || 0,
        is_active: announcement.is_active !== undefined ? announcement.is_active : true,
        date_range: startDate && endDate ? [startDate, endDate] : undefined,
        delay: announcement.delay,
        
        // Promosyon/İndirim alanları
        discount_type: announcement.discount_type,
        discount_value: announcement.discount_value,
        applicable_products: announcement.applicable_products,
        applicable_categories: announcement.applicable_categories,
        
        // Kampanya alanları
        campaign_condition: announcement.campaign_condition,
        campaign_reward: announcement.campaign_reward,
        
        // Görsel ve diğer alanlar
        button_text: announcement.button_text,
        button_color: announcement.button_color || '#007bff',
        button_url: announcement.button_url,
      });
      
      // Duyuru tipini ayarla
      setAnnouncementType(announcement.type || 'general');
      
      // Görsel önizlemeleri ayarla
      if (announcement.image_url) {
        console.log("🖼️ Orijinal Görsel URL'i:", announcement.image_url);
        
        // Görsel URL'ini düzenle
        let imageUrl = announcement.image_url;
        
        // Eğer tam URL değilse ve /public/ içermiyorsa
        if (!imageUrl.startsWith('http') && !imageUrl.includes('/public/')) {
          // Dosya adı olarak kabul et ve tam yolu oluştur
          imageUrl = `${API_URL}/public/images/${imageUrl}`;
        } 
        // Eğer /public/ ile başlıyorsa API_URL ile birleştir
        else if (imageUrl.startsWith('/public/')) {
          imageUrl = `${API_URL}${imageUrl}`;
        }
        
        console.log("🖼️ Düzeltilmiş Görsel URL'i:", imageUrl);
        setImageUrl(imageUrl);
      }
      
      if (announcement.background_image_url) {
        console.log("🖼️ Orijinal Arka Plan URL'i:", announcement.background_image_url);
        
        // Arka plan görsel URL'ini düzenle
        let bgImageUrl = announcement.background_image_url;
        
        // Eğer tam URL değilse ve /public/ içermiyorsa
        if (!bgImageUrl.startsWith('http') && !bgImageUrl.includes('/public/')) {
          // Dosya adı olarak kabul et ve tam yolu oluştur
          bgImageUrl = `${API_URL}/public/images/${bgImageUrl}`;
        }
        // Eğer /public/ ile başlıyorsa API_URL ile birleştir
        else if (bgImageUrl.startsWith('/public/')) {
          bgImageUrl = `${API_URL}${bgImageUrl}`;
        }
        
        console.log("🖼️ Düzeltilmiş Arka Plan URL'i:", bgImageUrl);
        setBackgroundImageUrl(bgImageUrl);
      }
    }
  }, [announcement, form]);

  // Duyuru tipi değiştiğinde çalışır
  const handleTypeChange = (value) => {
    setAnnouncementType(value);
    // Gerekirse diğer tab'a geç
    if (value === 'promotion' || value === 'discount' || value === 'campaign') {
      setActiveTab('2');
    }
  };

  // Görsel yükleme işlemleri - EditModal.jsx'deki gibi
  const handleImageUpload = ({ file }) => {
    console.log("📤 Görsel yükleniyor:", file.name);
    
    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      message.error('Sadece görsel dosyaları kabul edilir');
      return;
    }

    // Dosyayı state'e kaydet ve URL oluştur
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    console.log("🔗 Görsel için URL oluşturuldu:", URL.createObjectURL(file));
  };

  // Arka plan görseli yükleme işlemleri
  const handleBackgroundImageUpload = ({ file }) => {
    console.log("📤 Arka plan görseli yükleniyor:", file.name);
    
    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      message.error('Sadece görsel dosyaları kabul edilir');
      return;
    }

    // Dosyayı state'e kaydet ve URL oluştur
    setBackgroundImageFile(file);
    setBackgroundImageUrl(URL.createObjectURL(file));
    console.log("🔗 Arka plan için URL oluşturuldu:", URL.createObjectURL(file));
  };

  // Görsel kaldırma işlemleri
  const removeImage = () => {
    setImageUrl('');
    setImageFile(null);
    form.setFieldsValue({ image: undefined });
  };

  const removeBackgroundImage = () => {
    setBackgroundImageUrl('');
    setBackgroundImageFile(null);
    form.setFieldsValue({ background_image: undefined });
  };

  // Tab değişikliği
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Form gönderme işlemi
  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      console.log('🔄 Form değerleri:', values);
      
      // FormData kullanarak dosya yükleme
      const submitFormData = new FormData();
      
      // Temel alanlar
      submitFormData.append('title', values.title);
      submitFormData.append('type', values.type);
      submitFormData.append('content', values.content || '');
      submitFormData.append('priority', values.priority || 0);
      submitFormData.append('is_active', values.is_active);
      
      // Tarih aralığı
      if (values.date_range && values.date_range.length === 2) {
        submitFormData.append('start_date', values.date_range[0].format('YYYY-MM-DD'));
        submitFormData.append('end_date', values.date_range[1].format('YYYY-MM-DD'));
      }
      
      // Gecikme
      if (values.delay) {
        submitFormData.append('delay', values.delay);
      }
      
      // Duyuru tipine göre özel alanlar
      if (values.type === 'promotion' || values.type === 'discount') {
        submitFormData.append('discount_type', values.discount_type);
        submitFormData.append('discount_value', values.discount_value);
        
        if (values.applicable_products && values.applicable_products.length > 0) {
          submitFormData.append('applicable_products', JSON.stringify(values.applicable_products));
        }
        
        if (values.applicable_categories && values.applicable_categories.length > 0) {
          submitFormData.append('applicable_categories', JSON.stringify(values.applicable_categories));
        }
      }
      
      if (values.type === 'campaign') {
        submitFormData.append('campaign_condition', values.campaign_condition || '');
        submitFormData.append('campaign_reward', values.campaign_reward || '');
      }
      
      // Buton alanları
      if (values.button_text) {
        submitFormData.append('button_text', values.button_text);
        submitFormData.append('button_color', values.button_color || '#007bff');
        submitFormData.append('button_url', values.button_url || '');
      }
      
      // Dosyaları ekle
      if (imageFile) {
        // Yeni görsel dosyası seçildiyse ekle
        submitFormData.append('image', imageFile, imageFile.name);
        console.log('📸 Yeni görsel ekleniyor:', imageFile.name);
      } else if (imageUrl && announcement) {
        // Mevcut görsel korunuyorsa, sadece path bilgisini gönder
        // URL'den path'i çıkar (örn: http://localhost:5000/public/images/1234.jpg -> /public/images/1234.jpg)
        const imagePath = imageUrl.includes(API_URL) 
          ? imageUrl.replace(API_URL, '') 
          : imageUrl;
          
        submitFormData.append('existing_image_path', imagePath);
        console.log('🖼️ Mevcut görsel korunuyor:', imagePath);
      }
      
      if (backgroundImageFile) {
        // Yeni arka plan görseli seçildiyse ekle
        submitFormData.append('background_image', backgroundImageFile, backgroundImageFile.name);
        console.log('🖼️ Yeni arka plan görseli ekleniyor:', backgroundImageFile.name);
      } else if (backgroundImageUrl && announcement) {
        // Mevcut arka plan görseli korunuyorsa, sadece path bilgisini gönder
        const bgImagePath = backgroundImageUrl.includes(API_URL) 
          ? backgroundImageUrl.replace(API_URL, '') 
          : backgroundImageUrl;
          
        submitFormData.append('existing_background_image_path', bgImagePath);
        console.log('🖼️ Mevcut arka plan görseli korunuyor:', bgImagePath);
      }
      
      // FormData içeriğini kontrol et
      console.log('📦 Gönderilecek form verileri:');
      for (let pair of submitFormData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      
      let response;
      if (announcement) {
        console.log('🔄 Duyuru güncelleniyor... ID:', announcement.id);
        
        // Token'ı al
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          return;
        }
        
        // Doğrudan fetch ile gönder
        const fetchResponse = await fetch(`${API_URL}/api/announcements/${announcement.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: submitFormData
        });
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.error('❌ Güncelleme hatası:', errorText);
          throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
        }
        
        response = await fetchResponse.json();
      } else {
        console.log('➕ Yeni duyuru oluşturuluyor...');
        
        // Token'ı al
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          return;
        }
        
        // Doğrudan fetch ile gönder
        const fetchResponse = await fetch(`${API_URL}/api/announcements`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: submitFormData
        });
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.error('❌ Oluşturma hatası:', errorText);
          throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
        }
        
        response = await fetchResponse.json();
      }
      
      console.log('📦 API yanıtı:', response);
      
      // Response kontrolü
      if (response.success || response.data?.success) {
        message.success('Duyuru başarıyla kaydedildi!');
        
        // Güncellenmiş duyuru verisini geç
        const updatedAnnouncement = response.data || response;
        onSuccess(updatedAnnouncement);
      } else {
        const errorMsg = response.data?.message || response.message || 'Duyuru kaydedilemedi';
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('Duyuru kaydedilirken hata:', error);
      message.error(`Duyuru kaydedilemedi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Önizleme bileşeni
  const AnnouncementPreview = ({ formValues }) => {
    const { title, content, type } = formValues || {};
    
    return (
      <div className="announcement-preview">
        <div className="preview-header">
          <h3>Önizleme</h3>
    </div>
        
        <div className="preview-content">
          <div className="preview-card">
            <div className="preview-type-badge">
              {type === 'promotion' && 'PROMOSYON'}
              {type === 'campaign' && 'KAMPANYA'}
              {type === 'discount' && 'İNDİRİM'}
              {type === 'general' && 'DUYURU'}
        </div>

            <div className="preview-image-container">
              {imageUrl ? (
                <img src={imageUrl} alt="Duyuru Görseli" className="preview-image" />
              ) : (
                <div className="preview-image-placeholder">Görsel Yok</div>
              )}
        </div>

            <div className="preview-text-container">
              <h4 className="preview-title">{title || 'Duyuru Başlığı'}</h4>
              <p className="preview-description">{content || 'Duyuru içeriği burada görüntülenecek...'}</p>
              
              {type === 'promotion' && formValues.discount_type && (
                <div className="preview-discount">
                  <span className="discount-label">
                    {formValues.discount_type === 'percentage' ? `%${formValues.discount_value}` : `${formValues.discount_value} TL`} İndirim
                  </span>
        </div>
              )}
              
              {type === 'campaign' && formValues.campaign_condition && (
                <div className="preview-campaign">
                  <p className="campaign-condition">{formValues.campaign_condition}</p>
                  <p className="campaign-reward">{formValues.campaign_reward}</p>
        </div>
              )}
              
              {formValues.button_text && (
                <button 
                  className="preview-button"
                  style={{ backgroundColor: formValues.button_color || '#007bff' }}
                >
                  {formValues.button_text}
                </button>
              )}
          </div>
          </div>
        </div>
        </div>
    );
  };

  // Form render fonksiyonu
  const renderForm = () => {
        return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'general',
          priority: 0,
          is_active: true
        }}
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Genel Bilgiler" key="1">
            <Form.Item
              label="Duyuru Başlığı"
              name="title"
              rules={[{ required: true, message: 'Lütfen duyuru başlığını girin!' }]}
            >
              <Input placeholder="Duyuru başlığı" />
            </Form.Item>
            
            <Form.Item
              label="Duyuru Türü"
              name="type"
              rules={[{ required: true, message: 'Lütfen duyuru türünü seçin!' }]}
            >
              <Select onChange={handleTypeChange}>
                <Option value="general">Genel Duyuru</Option>
                <Option value="promotion">Promosyon</Option>
                <Option value="campaign">Kampanya</Option>
                <Option value="discount">İndirim</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              label="İçerik"
                name="content"
            >
              <TextArea rows={4} placeholder="Duyuru içeriği" />
            </Form.Item>
            
            <Form.Item
              label="Görsel"
              name="image"
            >
              {imageUrl ? (
                <div style={{ marginBottom: '10px' }}>
                  <img 
                    src={imageUrl} 
                    alt="Duyuru görseli" 
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                    onError={(e) => {
                      console.error("🚫 Görsel yüklenemedi:", imageUrl);
                      e.target.onerror = null; 
                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22120%22%20height%3D%22120%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22120%22%20height%3D%22120%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2236.5%22%20y%3D%2264.5%22%3EGörsel%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                    }}
                  />
                  <Button type="primary" onClick={removeImage} style={{ marginLeft: '10px', marginTop: '5px' }}>
                    Resimi Kaldır
                  </Button>
                </div>
              ) : (
                <Upload
                  accept="image/*"
                  beforeUpload={() => false}
                  onChange={handleImageUpload}
                  showUploadList={false}
                >
                  <Button style={{ width: '120px', height: '120px' }} icon={<PlusOutlined />}>
                    Görsel Yükle
                  </Button>
                </Upload>
              )}
            </Form.Item>
            
            <Form.Item
              label="Tarih Aralığı"
              name="date_range"
            >
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              label="Öncelik"
              name="priority"
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              label="Durum"
              name="is_active"
              valuePropName="checked"
            >
              <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
            </Form.Item>
            
            <Form.Item
              label="Gecikme (ms)"
              name="delay"
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="5000" />
            </Form.Item>
          </TabPane>
          
          <TabPane tab="Özel Ayarlar" key="2">
            {announcementType === 'promotion' || announcementType === 'discount' ? (
              <>
                <Form.Item
                  label="İndirim Türü"
                  name="discount_type"
                  rules={[{ required: true, message: 'Lütfen indirim türünü seçin!' }]}
                >
                  <Radio.Group>
                    <Radio value="percentage">Yüzde (%)</Radio>
                    <Radio value="amount">Tutar (TL)</Radio>
                  </Radio.Group>
                </Form.Item>
                
                <Form.Item
                  label="İndirim Değeri"
                  name="discount_value"
                  rules={[{ required: true, message: 'Lütfen indirim değerini girin!' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                
                <Form.Item
                  label="Geçerli Ürünler"
                  name="applicable_products"
                >
                  <Select
                    mode="multiple"
                    placeholder="Ürün seçin"
                    style={{ width: '100%' }}
                    options={products}
                    optionFilterProp="label"
                  />
                </Form.Item>
                
                <Form.Item
                  label="Geçerli Kategoriler"
                  name="applicable_categories"
                >
                  <Select
                    mode="multiple"
                    placeholder="Kategori seçin"
                    style={{ width: '100%' }}
                    options={categories}
                    optionFilterProp="label"
                  />
                </Form.Item>
              </>
            ) : announcementType === 'campaign' ? (
              <>
                <Form.Item
                  label="Kampanya Koşulu"
                  name="campaign_condition"
                  rules={[{ required: true, message: 'Lütfen kampanya koşulunu girin!' }]}
                >
                  <Input placeholder="Örn: Minimum 200 TL sipariş" />
                </Form.Item>
                
                <Form.Item
                  label="Kampanya Ödülü"
                  name="campaign_reward"
                  rules={[{ required: true, message: 'Lütfen kampanya ödülünü girin!' }]}
                >
                  <Input placeholder="Örn: Ücretsiz tatlı" />
                </Form.Item>
                
                <Form.Item
                  label="Arka Plan Görseli"
                  name="background_image"
                >
                  {backgroundImageUrl ? (
                    <div style={{ marginBottom: '10px' }}>
                      <img 
                        src={backgroundImageUrl} 
                        alt="Arka plan görseli" 
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                        onError={(e) => {
                          console.error("🚫 Arka plan görseli yüklenemedi:", backgroundImageUrl);
                          e.target.onerror = null; 
                          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22120%22%20height%3D%22120%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22120%22%20height%3D%22120%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2236.5%22%20y%3D%2264.5%22%3EGörsel%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                        }}
                      />
                      <Button type="primary" onClick={removeBackgroundImage} style={{ marginLeft: '10px', marginTop: '5px' }}>
                        Arka Planı Kaldır
                      </Button>
                    </div>
                  ) : (
                    <Upload
                      accept="image/*"
                      beforeUpload={() => false}
                      onChange={handleBackgroundImageUpload}
                      showUploadList={false}
                    >
                      <Button style={{ width: '120px', height: '120px' }} icon={<PlusOutlined />}>
                        Arka Plan Yükle
                      </Button>
                    </Upload>
                  )}
                </Form.Item>
              </>
            ) : (
              <div className="empty-tab-message">
                Bu duyuru türü için özel ayar bulunmamaktadır.
              </div>
            )}
            
            <Divider />
            
            <Form.Item
              label="Buton Metni"
                  name="button_text"
            >
              <Input placeholder="Detaylar" />
            </Form.Item>
            
            <Form.Item
              label="Buton Rengi"
                  name="button_color"
            >
              <Input type="color" style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              label="Buton URL"
                name="button_url"
            >
              <Input placeholder="https://example.com" />
            </Form.Item>
          </TabPane>
          
          <TabPane tab="Önizleme" key="3">
            <AnnouncementPreview formValues={form.getFieldsValue(true)} />
          </TabPane>
        </Tabs>
        
        <div className="form-actions">
          <Button type="default" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {announcement ? 'Güncelle' : 'Oluştur'}
          </Button>
            </div>
      </Form>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{announcement ? 'Duyuru Düzenle' : 'Yeni Duyuru'}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {renderForm()}
          </div>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;
