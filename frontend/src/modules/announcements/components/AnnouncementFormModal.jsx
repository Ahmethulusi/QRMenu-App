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
import { apiPost, apiPut, apiGet } from '../../common/utils/api';
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
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Önizleme için mevcut tarihleri tut (placeholder'da gösterilen tarihler)
  const [previewDates, setPreviewDates] = useState({
    start_date: null,
    end_date: null,
    countdown_date: null
  });

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

  // Geri sayım için timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Düzenleme durumunda formu doldur
  useEffect(() => {
    if (announcement) {
      console.log("📋 Düzenlenecek duyuru:", announcement);
      
      // Tarih alanlarını moment nesnelerine dönüştür
      // Backend'den gelen tarih string'lerini moment nesnelerine çevir
      let startDate = null;
      let endDate = null;
      let countdownDate = null;
      
      try {
        if (announcement.start_date) {
          startDate = moment(announcement.start_date);
          console.log("📅 Başlangıç tarihi parse edildi:", startDate.format('YYYY-MM-DD HH:mm:ss'));
        }
        // Düzenleme modalında tarih yoksa boş bırak (otomatik ilerleme olmasın)
        
        if (announcement.end_date) {
          endDate = moment(announcement.end_date);
          console.log("📅 Bitiş tarihi parse edildi:", endDate.format('YYYY-MM-DD HH:mm:ss'));
        }
        // Düzenleme modalında tarih yoksa boş bırak (otomatik ilerleme olmasın)
        
        if (announcement.countdown_date) {
          countdownDate = moment(announcement.countdown_date);
          console.log("⏰ Geri sayım tarihi parse edildi:", countdownDate.format('YYYY-MM-DD HH:mm:ss'));
        }
        // Düzenleme modalında tarih yoksa boş bırak (otomatik ilerleme olmasın)
        
        // Önizleme için mevcut tarihleri set et
        setPreviewDates({
          start_date: startDate,
          end_date: endDate,
          countdown_date: countdownDate
        });
      } catch (error) {
        console.error("❌ Tarih parse hatası:", error);
        message.warning("Bazı tarih alanları düzgün yüklenemedi");
      }
      
      form.setFieldsValue({
        title: announcement.title,
        type: announcement.type || 'general',
        content: announcement.content,
        priority: announcement.priority || 0,
        is_active: announcement.is_active !== undefined ? announcement.is_active : true,
        start_date: undefined, // Tarih alanları boş bırak (placeholder'da göster)
        end_date: undefined,   // Tarih alanları boş bırak (placeholder'da göster)
        delay: announcement.delay,
        countdown_date: undefined, // Tarih alanları boş bırak (placeholder'da göster)
        
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

  // Geri sayım hesaplama fonksiyonu
  const calculateCountdown = (countdownDate) => {
    if (!countdownDate) return null;
    
    const targetDate = new Date(countdownDate);
    const diff = targetDate.getTime() - currentTime.getTime();
    
    if (diff <= 0) {
      return { expired: true };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, expired: false };
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
      
      // Tarih alanları
      if (values.start_date) {
        const startDate = values.start_date.format('YYYY-MM-DD HH:mm:ss');
        console.log('📅 Başlangıç tarihi gönderiliyor:', startDate);
        submitFormData.append('start_date', startDate);
      }
      
      if (values.end_date) {
        const endDate = values.end_date.format('YYYY-MM-DD HH:mm:ss');
        console.log('📅 Bitiş tarihi gönderiliyor:', endDate);
        submitFormData.append('end_date', endDate);
      }
      
      // Gecikme
      if (values.delay) {
        submitFormData.append('delay', values.delay);
      }
      
      // Geri sayım tarihi
      if (values.countdown_date) {
        const countdownDate = values.countdown_date.format('YYYY-MM-DD HH:mm:ss');
        console.log('⏰ Geri sayım tarihi gönderiliyor:', countdownDate);
        submitFormData.append('countdown_date', countdownDate);
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
  const ResponsiveAnnouncementPreview = ({ formValues, device, previewDates }) => {
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
                    
                                      {/* Geri Sayım - Sadece Mobil için görselin üzerinde */}
                  {device === 'mobile' && (formValues.countdown_date || previewDates?.countdown_date) && (() => {
                    const countdownDate = formValues.countdown_date || previewDates?.countdown_date;
                    const countdown = calculateCountdown(countdownDate);
                    if (!countdown) return null;
                    
                    if (countdown.expired) {
                      return (
                        <div className="countdown-overlay expired">
                          <div className="countdown-label-small">⏰ Sona Erdi</div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="countdown-overlay">
                        <div className="countdown-timer-small">
                          {countdown.days > 0 ? (
                            <span className="countdown-compact">{countdown.days}g {countdown.hours}s {countdown.minutes}d {countdown.seconds}sn</span>
                          ) : countdown.hours > 0 ? (
                            <span className="countdown-compact">{countdown.hours}s {countdown.minutes}d {countdown.seconds}sn</span>
                          ) : (
                            <span className="countdown-compact">{countdown.minutes}d {countdown.seconds}sn</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  </div>
                )}

                {/* Başlık ve İçerik */}
                <div className="announcement-text">
                  <h2 className="announcement-title">{title || 'Duyuru Başlığı'}</h2>
                  
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
                  
                  {/* Geri Sayım - Sadece tablet ve desktop için */}
                  {device !== 'mobile' && (formValues.countdown_date || previewDates?.countdown_date) && (() => {
                    const countdownDate = formValues.countdown_date || previewDates?.countdown_date;
                    const countdown = calculateCountdown(countdownDate);
                    if (!countdown) return null;
                    
                    if (countdown.expired) {
                      return (
                        <div className="countdown-info expired">
                          <div className="countdown-label">⏰ Kampanya Sona Erdi</div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="countdown-info">
                        <div className="countdown-label">⏰ Kalan Süre:</div>
                        <div className="countdown-timer">
                          {countdown.days > 0 && (
                            <div className="countdown-unit">
                              <span className="countdown-value">{countdown.days}</span>
                              <span className="countdown-text">Gün</span>
                            </div>
                          )}
                          <div className="countdown-unit">
                            <span className="countdown-value">{countdown.hours.toString().padStart(2, '0')}</span>
                            <span className="countdown-text">Saat</span>
                          </div>
                          <div className="countdown-unit">
                            <span className="countdown-value">{countdown.minutes.toString().padStart(2, '0')}</span>
                            <span className="countdown-text">Dakika</span>
                          </div>
                          <div className="countdown-unit">
                            <span className="countdown-value">{countdown.seconds.toString().padStart(2, '0')}</span>
                            <span className="countdown-text">Saniye</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Kapat İkonu */}
                <div className="close-icon">×</div>

                {/* Aksiyon Butonları */}
                {formValues.button_text && (
                  <div className="announcement-actions">
                    <div 
                      className="action-button primary disabled"
                      style={{ 
                        backgroundColor: formValues.button_color || '#007bff',
                        borderColor: formValues.button_color || '#007bff'
                      }}
                    >
                      {formValues.button_text}
                    </div>
                  </div>
                )}
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
          <ResponsiveAnnouncementPreview 
            formValues={formValues} 
            device={selectedDevice}
            previewDates={previewDates}
          />
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
          is_active: true,
          start_date: undefined,
          end_date: undefined,
          countdown_date: undefined,
          delay: undefined,
          discount_type: undefined,
          discount_value: undefined,
          applicable_products: undefined,
          applicable_categories: undefined,
          campaign_condition: undefined,
          campaign_reward: undefined,
          button_text: undefined,
          button_color: '#007bff',
          button_url: undefined
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
              <Select 
                onChange={handleTypeChange}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ minWidth: '200px' }}
                listHeight={300}
              >
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
              label="Başlangıç Tarihi ve Saati"
              name="start_date"
              tooltip="Duyurunun başlangıç tarihi ve saati"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const endDate = getFieldValue('end_date');
                    if (endDate && value.isAfter(endDate)) {
                      return Promise.reject(new Error('Başlangıç tarihi bitiş tarihinden sonra olamaz!'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker 
                showTime={{ 
                  format: 'HH:mm'
                }}
                format="YYYY-MM-DD HH:mm"
                placeholder={announcement?.start_date ? `Mevcut: ${moment(announcement.start_date).format('DD.MM.YYYY HH:mm')}` : "Başlangıç tarihi seçin"}
                style={{ width: '100%' }}
                minuteStep={15}
                allowClear={true}
                showNow={true}
                onChange={(date) => {
                  if (date) {
                    console.log('📅 Başlangıç tarihi seçildi:', date.format('YYYY-MM-DD HH:mm:ss'));
                  } else {
                    console.log('📅 Başlangıç tarihi temizlendi');
                  }
                }}
              />
            </Form.Item>
            
            <Form.Item
              label="Bitiş Tarihi ve Saati"
              name="end_date"
              tooltip="Duyurunun bitiş tarihi ve saati"
              dependencies={['start_date']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const startDate = getFieldValue('start_date');
                    if (startDate && value.isBefore(startDate)) {
                      return Promise.reject(new Error('Bitiş tarihi başlangıç tarihinden önce olamaz!'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker 
                showTime={{ 
                  format: 'HH:mm'
                }}
                format="YYYY-MM-DD HH:mm"
                placeholder={announcement?.end_date ? `Mevcut: ${moment(announcement.end_date).format('DD.MM.YYYY HH:mm')}` : "Bitiş tarihi seçin"}
                style={{ width: '100%' }}
                minuteStep={15}
                allowClear={true}
                showNow={true}
                onChange={(date) => {
                  if (date) {
                    console.log('📅 Bitiş tarihi seçildi:', date.format('YYYY-MM-DD HH:mm:ss'));
                  } else {
                    console.log('📅 Bitiş tarihi temizlendi');
                  }
                }}
              />
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
            
            <Form.Item
              label="Geri Sayım Tarihi"
              name="countdown_date"
              tooltip="Kampanya bitişi için geri sayım göstermek istediğiniz tarih ve saat"
            >
              <DatePicker 
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                placeholder={announcement?.countdown_date ? `Mevcut: ${moment(announcement.countdown_date).format('DD.MM.YYYY HH:mm')}` : "Geri sayım tarihi seçin"}
                style={{ width: '100%' }}
                allowClear={true}
                showNow={true}
                onChange={(date) => {
                  if (date) {
                    console.log('⏰ Geri sayım tarihi seçildi:', date.format('YYYY-MM-DD HH:mm:ss'));
                  } else {
                    console.log('⏰ Geri sayım tarihi temizlendi');
                  }
                }}
              />
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
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{ minWidth: '200px' }}
                    listHeight={300}
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
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{ minWidth: '200px' }}
                    listHeight={300}
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
