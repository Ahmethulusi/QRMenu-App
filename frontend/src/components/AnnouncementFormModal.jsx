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

// Görsel URL'lerini düzeltmek için yardımcı fonksiyon
const getCorrectImageUrl = (url) => {
  if (!url) return null;
  
  console.log("🔍 URL düzeltiliyor:", url);
  
  // Eğer tam URL ise (http:// veya https:// ile başlıyorsa) doğrudan kullan
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log("✅ Tam URL kullanılıyor:", url);
    return url;
  }
  
  // Eğer sadece dosya adı ise (örn: 1234.jpg) tam yolu oluştur
  // Bu, veritabanında sadece dosya adının saklandığı durum için
  if (!url.includes('/')) {
    // Burada doğrudan API_URL'yi kullanmak yerine tam yolu belirtiyoruz
    // Backend'in express.static ile public klasörünü sunduğunu biliyoruz
    const fullUrl = `${API_URL}/images/${url}`;
    console.log("✅ Dosya adı için tam yol oluşturuluyor:", fullUrl);
    return fullUrl;
  }
  
  // Eğer /public/ ile başlıyorsa, public kısmını kaldır çünkü express.static zaten public klasörünü sunuyor
  if (url.includes('/public/')) {
    const cleanPath = url.replace('/public', '');
    const fullUrl = `${API_URL}${cleanPath}`;
    console.log("✅ /public/ yolu düzeltiliyor:", fullUrl);
    return fullUrl;
  }
  
  // Diğer tüm durumlar için API_URL ile birleştir
  const fullUrl = `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  console.log("✅ Genel durum - URL birleştiriliyor:", fullUrl);
  return fullUrl;
};

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
  const [selectedDevice, setSelectedDevice] = useState('mobile'); // mobile, tablet, desktop

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
        
        // Eğer sadece dosya adı ise tam URL oluştur
        if (!announcement.image_url.includes('/')) {
          const fullUrl = `${API_URL}/images/${announcement.image_url}`;
          console.log("✅ Dosya adı için tam yol oluşturuldu:", fullUrl);
          setImageUrl(fullUrl);
        } else {
          // Eğer /public/ içeriyorsa, kaldır
          if (announcement.image_url.includes('/public/')) {
            const cleanPath = announcement.image_url.replace('/public', '');
            const fullUrl = `${API_URL}${cleanPath}`;
            console.log("✅ /public/ yolu düzeltildi:", fullUrl);
            setImageUrl(fullUrl);
          } else {
            // Diğer durumlar için API_URL ile birleştir
            const fullUrl = `${API_URL}${announcement.image_url.startsWith('/') ? '' : '/'}${announcement.image_url}`;
            console.log("✅ Genel durum - URL birleştirildi:", fullUrl);
            setImageUrl(fullUrl);
          }
        }
      }
      
      // Arka plan görseli için aynı işlem
      if (announcement.background_image_url) {
        console.log("🖼️ Orijinal Arka Plan URL'i:", announcement.background_image_url);
        
        // Eğer sadece dosya adı ise tam URL oluştur
        if (!announcement.background_image_url.includes('/')) {
          const fullUrl = `${API_URL}/images/${announcement.background_image_url}`;
          console.log("✅ Dosya adı için tam yol oluşturuldu:", fullUrl);
          setBackgroundImageUrl(fullUrl);
        } else {
          // Eğer /public/ içeriyorsa, kaldır
          if (announcement.background_image_url.includes('/public/')) {
            const cleanPath = announcement.background_image_url.replace('/public', '');
            const fullUrl = `${API_URL}${cleanPath}`;
            console.log("✅ /public/ yolu düzeltildi:", fullUrl);
            setBackgroundImageUrl(fullUrl);
          } else {
            // Diğer durumlar için API_URL ile birleştir
            const fullUrl = `${API_URL}${announcement.background_image_url.startsWith('/') ? '' : '/'}${announcement.background_image_url}`;
            console.log("✅ Genel durum - URL birleştirildi:", fullUrl);
            setBackgroundImageUrl(fullUrl);
          }
        }
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

  // Görsel yükleme işlemleri - CategoryFormModal.jsx'deki gibi
  const handleImageUpload = (info) => {
    console.log("📤 Görsel yükleniyor:", info);
    const file = info.file;
    
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
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    console.log("🔗 Görsel için URL oluşturuldu:", objectUrl);
  };

  // Arka plan görseli yükleme işlemleri - CategoryFormModal.jsx'deki gibi
  const handleBackgroundImageUpload = (info) => {
    console.log("📤 Arka plan görseli yükleniyor:", info);
    const file = info.file;
    
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
    const objectUrl = URL.createObjectURL(file);
    setBackgroundImageUrl(objectUrl);
    console.log("🔗 Arka plan için URL oluşturuldu:", objectUrl);
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
        // Mevcut görsel korunuyorsa, sadece dosya adını gönder
        let imagePath = imageUrl;
        
        // URL'den dosya adını çıkar
        if (imageUrl.includes('/public/images/')) {
          imagePath = imageUrl.split('/public/images/').pop();
        } else if (imageUrl.includes('/')) {
          // Başka bir yol formatı varsa en son / sonrasını al
          imagePath = imageUrl.split('/').pop();
        }
        
        submitFormData.append('existing_image_path', imagePath);
        console.log('🖼️ Mevcut görsel korunuyor (dosya adı):', imagePath);
      }
      
      if (backgroundImageFile) {
        // Yeni arka plan görseli seçildiyse ekle
        submitFormData.append('background_image', backgroundImageFile, backgroundImageFile.name);
        console.log('🖼️ Yeni arka plan görseli ekleniyor:', backgroundImageFile.name);
      } else if (backgroundImageUrl && announcement) {
        // Mevcut arka plan görseli korunuyorsa, sadece dosya adını gönder
        let bgImagePath = backgroundImageUrl;
        
        // URL'den dosya adını çıkar
        if (backgroundImageUrl.includes('/public/images/')) {
          bgImagePath = backgroundImageUrl.split('/public/images/').pop();
        } else if (backgroundImageUrl.includes('/')) {
          // Başka bir yol formatı varsa en son / sonrasını al
          bgImagePath = backgroundImageUrl.split('/').pop();
        }
        
        submitFormData.append('existing_background_image_path', bgImagePath);
        console.log('🖼️ Mevcut arka plan görseli korunuyor (dosya adı):', bgImagePath);
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

  // Cihaz seçimi kartları
  const DeviceSelector = () => {
    const devices = [
      { 
        id: 'mobile', 
        name: 'Telefon', 
        icon: '📱', 
        dimensions: '320x568px',
        description: 'iOS/Android Telefon Görünümü'
      },
      { 
        id: 'tablet', 
        name: 'Tablet', 
        icon: '📱', 
        dimensions: '768x1024px',
        description: 'iPad/Android Tablet Görünümü'
      },
      { 
        id: 'desktop-hd', 
        name: 'Laptop', 
        icon: '💻', 
        dimensions: '1366x768px',
        description: 'HD Laptop Görünümü'
      },
      { 
        id: 'desktop-fhd', 
        name: 'Masaüstü', 
        icon: '🖥️', 
        dimensions: '1920x1080px',
        description: 'Full HD Masaüstü Görünümü'
      },
      { 
        id: 'desktop-legacy', 
        name: 'Eski Ekran', 
        icon: '🖥️', 
        dimensions: '1280x800px',
        description: 'Geleneksel Bilgisayar Ekranı'
      }
    ];

    return (
      <div className="device-selector">
        <h4 style={{ marginBottom: '16px', color: '#333' }}>Cihaz Seçin:</h4>
        <div className="device-cards">
          {devices.map(device => (
            <div 
              key={device.id}
              className={`device-card ${selectedDevice === device.id ? 'active' : ''}`}
              onClick={() => setSelectedDevice(device.id)}
            >
              <div className="device-icon">{device.icon}</div>
              <div className="device-info">
                <h5>{device.name}</h5>
                <p className="device-dimensions">{device.dimensions}</p>
                <p className="device-description">{device.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Responsive önizleme bileşeni
  const ResponsiveAnnouncementPreview = ({ formValues, device }) => {
    const { title, content, type } = formValues || {};
    
    // Görsel URL'ini doğru şekilde kullan
    const previewImageUrl = imageFile 
      ? URL.createObjectURL(imageFile) 
      : (imageUrl ? imageUrl : null);
    
    const backgroundImagePreviewUrl = backgroundImageFile 
      ? URL.createObjectURL(backgroundImageFile) 
      : (backgroundImageUrl ? backgroundImageUrl : null);
    
    console.log("🖼️ Önizleme için görsel URL'i:", previewImageUrl);
    
    // Cihaza göre boyutları belirle
    const getDeviceDimensions = () => {
      switch (device) {
        case 'mobile':
          return { width: '320px', height: '568px', scale: 1.0 };
        case 'tablet':
          return { width: '768px', height: '1024px', scale: 0.65 };
        case 'desktop-hd':
          return { width: '1366px', height: '768px', scale: 0.35 };
        case 'desktop-fhd':
          return { width: '1920px', height: '1080px', scale: 0.25 };
        case 'desktop-legacy':
          return { width: '1280px', height: '800px', scale: 0.38 };
        default:
          return { width: '320px', height: '568px', scale: 1.0 };
      }
    };

    const dimensions = getDeviceDimensions();
    
    return (
      <div className="responsive-preview-container">
        <div className="device-frame" style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          transform: `scale(${dimensions.scale})`,
          transformOrigin: 'top center'
        }}>
          {/* QR Menu App Header Simülasyonu */}
          <div className="app-header">
            <div className="status-bar">
              <span className="time">14:30</span>
              <div className="status-icons">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>
            <div className="app-navigation">
              <h3>QR Menü</h3>
              <div className="nav-icons">
                <span>🏠</span>
                <span>🛒</span>
                <span>👤</span>
              </div>
            </div>
          </div>

          {/* Duyuru Modal Simülasyonu */}
          <div className="announcement-modal" style={{
            backgroundImage: backgroundImagePreviewUrl ? `url(${backgroundImagePreviewUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            <div className={`modal-overlay-blur ${device.startsWith('desktop') ? 'desktop-modal' : device === 'tablet' ? 'tablet-modal' : ''}`}>
              <div className={`announcement-content ${device.startsWith('desktop') ? 'desktop-content' : ''}`}>
                {/* Tür Badge */}
                <div className={`type-badge type-${type}`}>
                  {type === 'promotion' && '🎁 PROMOSYON'}
                  {type === 'campaign' && '🎯 KAMPANYA'}
                  {type === 'discount' && '🔥 İNDİRİM'}
                  {type === 'general' && '📢 DUYURU'}
                </div>

                {/* Ana Görsel */}
                {previewImageUrl && (
                  <div className="announcement-image">
                    <img 
                      src={previewImageUrl} 
                      alt="Duyuru Görseli" 
                      onLoad={() => console.log("✅ Önizlemede görsel başarıyla yüklendi:", previewImageUrl)}
                      onError={(e) => {
                        console.error("🚫 Önizleme görseli yüklenemedi:", previewImageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Başlık ve İçerik */}
                <div className="announcement-text">
                  <h2 className="announcement-title">{title || 'Duyuru Başlığı'}</h2>
                  <p className="announcement-description">{content || 'Duyuru içeriği burada görüntülenecek...'}</p>
                  
                  {/* Promosyon/İndirim Bilgisi */}
                  {(type === 'promotion' || type === 'discount') && formValues.discount_type && (
                    <div className="discount-info">
                      <div className="discount-badge">
                        {formValues.discount_type === 'percentage' 
                          ? `%${formValues.discount_value} İNDİRİM` 
                          : `${formValues.discount_value} TL İNDİRİM`}
                      </div>
                      {formValues.applicable_products && formValues.applicable_products.length > 0 && (
                        <p className="applicable-info">Seçili ürünlerde geçerli</p>
                      )}
                    </div>
                  )}
                  
                  {/* Kampanya Bilgisi */}
                  {type === 'campaign' && formValues.campaign_condition && (
                    <div className="campaign-info">
                      <div className="campaign-condition">
                        <strong>Koşul:</strong> {formValues.campaign_condition}
                      </div>
                      <div className="campaign-reward">
                        <strong>Kazanç:</strong> {formValues.campaign_reward}
                      </div>
                    </div>
                  )}
                </div>

                {/* Aksiyon Butonları */}
                <div className="announcement-actions">
                  {formValues.button_text && (
                    <div 
                      className="action-button primary disabled"
                      style={{ 
                        backgroundColor: formValues.button_color || '#007bff',
                        borderColor: formValues.button_color || '#007bff'
                      }}
                    >
                      {formValues.button_text}
                    </div>
                  )}
                  <div className="action-button secondary disabled">
                    Kapat
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sadece mobil için App Footer */}
          {device === 'mobile' && (
            <div className="app-footer">
              <div className="footer-nav">
                <div className="nav-item active">
                  <span>🏠</span>
                  <span>Ana Sayfa</span>
                </div>
                <div className="nav-item">
                  <span>📱</span>
                  <span>Menü</span>
                </div>
                <div className="nav-item">
                  <span>🛒</span>
                  <span>Sepet</span>
                </div>
                <div className="nav-item">
                  <span>👤</span>
                  <span>Profil</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Ana önizleme bileşeni
  const AnnouncementPreview = ({ formValues }) => {
    return (
      <div className="announcement-preview">
        <DeviceSelector />
        <div className="preview-content">
          <ResponsiveAnnouncementPreview formValues={formValues} device={selectedDevice} />
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
                    onLoad={() => console.log("✅ Form içinde görsel başarıyla yüklendi:", imageUrl)}
                    onError={(e) => {
                      console.error("🚫 Görsel yüklenemedi:", imageUrl);
                      e.target.onerror = null; 
                      // Hata durumunda URL'i konsola yazdır ve detaylı bilgi ver
                      console.log("🔍 Görsel URL detayları:", {
                        url: imageUrl,
                        isAbsolute: imageUrl.startsWith('http'),
                        containsPublic: imageUrl.includes('/public/'),
                        containsImages: imageUrl.includes('/images/'),
                        lastPart: imageUrl.split('/').pop()
                      });
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
                  listType="picture-card"
                  beforeUpload={() => false}
                  onChange={handleImageUpload}
                  showUploadList={false}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Görsel Yükle</div>
                  </div>
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
                        onLoad={() => console.log("✅ Form içinde arka plan görseli başarıyla yüklendi:", backgroundImageUrl)}
                        onError={(e) => {
                          console.error("🚫 Arka plan görseli yüklenemedi:", backgroundImageUrl);
                          e.target.onerror = null; 
                          // Hata durumunda URL'i konsola yazdır ve detaylı bilgi ver
                          console.log("🔍 Arka plan URL detayları:", {
                            url: backgroundImageUrl,
                            isAbsolute: backgroundImageUrl.startsWith('http'),
                            containsPublic: backgroundImageUrl.includes('/public/'),
                            containsImages: backgroundImageUrl.includes('/images/'),
                            lastPart: backgroundImageUrl.split('/').pop()
                          });
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
                      listType="picture-card"
                      beforeUpload={() => false}
                      onChange={handleBackgroundImageUpload}
                      showUploadList={false}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Arka Plan Yükle</div>
                      </div>
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
