import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { apiPost, apiPut } from '../utils/api';
import '../css/announcementFormModal.css';

const AnnouncementFormModal = ({ announcement, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    category: 'visual_only',
    priority: 0,
    is_active: true,
    start_date: '',
    end_date: '',
    delay: '',
    button_text: '',
    button_color: '#007bff',
    button_url: '',
    background_image_url: '',
    countdown_date: '',
    subscription_form_fields: {},
    newsletter_form_fields: {},
    layout_config: {}
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        image_url: announcement.image_url || '',
        category: announcement.category || 'visual_only',
        priority: announcement.priority || 0,
        is_active: announcement.is_active !== undefined ? announcement.is_active : true,
        start_date: announcement.start_date ? announcement.start_date.split('T')[0] : '',
        end_date: announcement.end_date ? announcement.start_date.split('T')[0] : '',
        delay: announcement.delay || '',
        button_text: announcement.button_text || '',
        button_color: announcement.button_color || '#007bff',
        button_url: announcement.button_url || '',
        background_image_url: announcement.background_image_url || '',
        countdown_date: announcement.countdown_date ? announcement.countdown_date.split('T')[0] : '',
        subscription_form_fields: announcement.subscription_form_fields || {},
        newsletter_form_fields: announcement.newsletter_form_fields || {},
        layout_config: announcement.layout_config || {}
      });
      
      // Mevcut görselleri önizleme olarak ayarla
      if (announcement.image_url) {
        setImagePreview(announcement.image_url);
      } else {
        setImagePreview(null);
      }
      if (announcement.background_image_url) {
        setBackgroundImagePreview(announcement.background_image_url);
      } else {
        setBackgroundImagePreview(null);
      }
      
      // Dosya referanslarını temizle
      setImageFile(null);
      setBackgroundImageFile(null);
    } else {
      // Yeni duyuru için state'i temizle
      setFormData({
        title: '',
        content: '',
        image_url: '',
        category: 'visual_only',
        priority: 0,
        is_active: true,
        start_date: '',
        end_date: '',
        delay: '',
        button_text: '',
        button_color: '#007bff',
        button_url: '',
        background_image_url: '',
        countdown_date: '',
        subscription_form_fields: {},
        newsletter_form_fields: {},
        layout_config: {}
      });
      
      // Görsel önizlemeleri temizle
      setImagePreview(null);
      setBackgroundImagePreview(null);
      setImageFile(null);
      setBackgroundImageFile(null);
    }
  }, [announcement]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [fieldName]: 'Dosya boyutu 5MB\'dan küçük olmalıdır' }));
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, [fieldName]: 'Sadece görsel dosyaları kabul edilir' }));
        return;
      }

      // Görsel önizleme
      const reader = new FileReader();
      reader.onload = (e) => {
        if (fieldName === 'image_url') {
          setImagePreview(e.target.result);
          setImageFile(file);
        } else if (fieldName === 'background_image_url') {
          setBackgroundImagePreview(e.target.result);
          setBackgroundImageFile(file);
        }
      };
      reader.readAsDataURL(file);

      // Form verisine dosya adını ekle
      setFormData(prev => ({
        ...prev,
        [fieldName]: file.name
      }));

      // Hata mesajını temizle
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
    }
  };

  const removeImage = (fieldName) => {
    if (fieldName === 'image_url') {
      setImagePreview(null);
      setImageFile(null);
      setFormData(prev => ({ ...prev, image_url: '' }));
    } else if (fieldName === 'background_image_url') {
      setBackgroundImagePreview(null);
      setBackgroundImageFile(null);
      setFormData(prev => ({ ...prev, background_image_url: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Başlık zorunludur';
    }
    
    if (!formData.category) {
      newErrors.category = 'Kategori seçimi zorunludur';
    }
    
    // Category-specific validations
    if (formData.category === 'visual_only' && !formData.image_url.trim()) {
      newErrors.image_url = 'Görsel seçimi zorunludur';
    }
    
    if (formData.category === 'subscription_form' && !formData.background_image_url.trim()) {
      newErrors.background_image_url = 'Arka plan görseli zorunludur';
    }
    
    if (formData.category === 'countdown_timer' && !formData.countdown_date) {
      newErrors.countdown_date = 'Geri sayım tarihi zorunludur';
    }
    
    if (formData.category === 'countdown_timer' && !formData.background_image_url.trim()) {
      newErrors.background_image_url = 'Arka plan görseli zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // FormData kullanarak dosya yükleme
      const submitFormData = new FormData();
      
      // Temel alanları ekle
      submitFormData.append('title', formData.title);
      submitFormData.append('category', formData.category);
      submitFormData.append('priority', formData.priority || 0);
      submitFormData.append('is_active', formData.is_active);
      submitFormData.append('start_date', formData.start_date || '');
      submitFormData.append('end_date', formData.end_date || '');
      submitFormData.append('delay', formData.delay || '');
      submitFormData.append('button_text', formData.button_text || '');
      submitFormData.append('button_color', formData.button_color || '#007bff');
      submitFormData.append('button_url', formData.button_url || '');
      submitFormData.append('countdown_date', formData.countdown_date || '');
      submitFormData.append('content', formData.content || '');
      
      // JSON alanları
      if (Object.keys(formData.subscription_form_fields).length > 0) {
        submitFormData.append('subscription_form_fields', JSON.stringify(formData.subscription_form_fields));
      }
      if (Object.keys(formData.newsletter_form_fields).length > 0) {
        submitFormData.append('newsletter_form_fields', JSON.stringify(formData.newsletter_form_fields));
      }
      if (Object.keys(formData.layout_config).length > 0) {
        submitFormData.append('layout_config', JSON.stringify(formData.layout_config));
      }
      
      // Dosyaları ekle
      if (imageFile) {
        submitFormData.append('image', imageFile);
      }
      if (backgroundImageFile) {
        submitFormData.append('background_image', backgroundImageFile);
      }
      
      let response;
      if (announcement) {
        response = await apiPut(`/api/announcements/${announcement.id}`, submitFormData);
      } else {
        response = await apiPost('/api/announcements', submitFormData);
      }
      
      console.log('📦 Form Response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response keys:', Object.keys(response));
      console.log('📦 Response.data:', response.data);
      console.log('📦 Response.success:', response.success);
      console.log('📦 Response.data.success:', response.data?.success);
      
      // Response yapısını kontrol et
      if (response.success || response.data?.success) {
        console.log('✅ Duyuru başarıyla kaydedildi!');
        message.success('Duyuru başarıyla kaydedildi!');
        console.log('🎯 onSuccess çağrılıyor...');
        
        // Güncellenmiş duyuru verisini geç
        const updatedAnnouncement = response.data || response;
        onSuccess(updatedAnnouncement);
      } else {
        console.log('❌ Duyuru kaydedilemedi:', response);
        const errorMsg = response.data?.message || response.message || 'Duyuru kaydedilemedi';
        message.error(errorMsg);
        setErrors({ general: errorMsg });
      }
    } catch (error) {
      console.error('Duyuru kaydedilirken hata:', error);
      const errorMsg = error.response?.data?.message || 'Bir hata oluştu';
      message.error(errorMsg);
      setErrors({ general: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const renderImageUpload = (fieldName, label, required = false) => {
    // Mevcut görsel URL'ini al
    const currentImageUrl = fieldName === 'image_url' ? formData.image_url : formData.background_image_url;
    const currentPreview = fieldName === 'image_url' ? imagePreview : backgroundImagePreview;
    
    // Görsel boyut önerileri
    const getSizeRecommendation = () => {
      if (fieldName === 'image_url') {
        return '📱 Önerilen: 1080x1920px (9:16) - Dikey mobil';
      } else if (fieldName === 'background_image_url') {
        return '📱 Önerilen: 1080x1920px (9:16) - Tam ekran';
      }
      return '';
    };
    
    // Görsel URL'ini oluştur (backend'den gelen dosya adı için)
    const getImageUrl = (filename) => {
      if (!filename) return null;
      if (filename.startsWith('http') || filename.startsWith('data:')) {
        return filename; // Zaten tam URL veya base64
      }
      return `http://localhost:5000/images/${filename}`; // Backend'den gelen dosya adı
    };
    
    const displayImageUrl = getImageUrl(currentImageUrl) || currentPreview;
    
    return (
      <div className="form-group">
        <label>{label} {required && '*'}</label>
        
        {/* Boyut önerisi */}
        <div className="size-recommendation">
          <span className="size-icon">📏</span>
          <span className="size-text">{getSizeRecommendation()}</span>
        </div>
        
        <div className="image-upload-container">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, fieldName)}
            className="file-input"
            id={fieldName}
          />
          <label htmlFor={fieldName} className="file-input-label">
            📁 Görsel Seç
          </label>
          
          {displayImageUrl && (
            <div className="image-preview-container">
              <img 
                src={displayImageUrl} 
                alt="Önizleme" 
                className="image-preview"
                onError={(e) => {
                  console.log('Görsel yüklenemedi:', displayImageUrl);
                  e.target.style.display = 'none';
                }}
              />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => removeImage(fieldName)}
              >
                ❌
              </button>
            </div>
          )}
        </div>
        {errors[fieldName] && <span className="error-message">{errors[fieldName]}</span>}
      </div>
    );
  };

  const renderFormFields = () => {
    const baseFields = (
      <>
        <div className="form-group">
          <label>Başlık *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>Kategori *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={errors.category ? 'error' : ''}
          >
            <option value="visual_only">Sadece Görsel</option>
            <option value="visual_text">Görsel + Metin</option>
            <option value="subscription_form">Abonelik Formu + Arka Plan</option>
            <option value="text_image_button">Metin + Görsel + Buton</option>
            <option value="newsletter_form">Newsletter Formu + Görsel</option>
            <option value="countdown_timer">Geri Sayım + Arka Plan</option>
            <option value="countdown_image">Geri Sayım + Sol Görsel</option>
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label>Öncelik</label>
          <input
            type="number"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Durum</label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
            />
            Aktif
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Başlangıç Tarihi</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Bitiş Tarihi</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Gecikme (milisaniye)</label>
          <input
            type="number"
            name="delay"
            value={formData.delay}
            onChange={handleInputChange}
            placeholder="5000"
          />
        </div>
      </>
    );

    // Category-specific fields
    switch (formData.category) {
      case 'visual_only':
        return (
          <>
            {baseFields}
            {renderImageUpload('image_url', 'Görsel', true)}
          </>
        );

      case 'visual_text':
        return (
          <>
            {baseFields}
            {renderImageUpload('image_url', 'Görsel')}
            <div className="form-group">
              <label>İçerik</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="4"
                placeholder="Duyuru içeriği..."
              />
            </div>
          </>
        );

      case 'subscription_form':
        return (
          <>
            {baseFields}
            {renderImageUpload('background_image_url', 'Arka Plan Görseli', true)}
            <div className="form-group">
              <label>İçerik</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="4"
                placeholder="Abonelik formu açıklaması..."
              />
            </div>
          </>
        );

      case 'text_image_button':
        return (
          <>
            {baseFields}
            {renderImageUpload('image_url', 'Sol Görsel')}
            <div className="form-group">
              <label>Sağ Metin</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="4"
                placeholder="Sağ tarafta görünecek metin..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Buton Metni</label>
                <input
                  type="text"
                  name="button_text"
                  value={formData.button_text}
                  onChange={handleInputChange}
                  placeholder="Tıkla"
                />
              </div>
              <div className="form-group">
                <label>Buton Rengi</label>
                <input
                  type="color"
                  name="button_color"
                  value={formData.button_color}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Buton URL</label>
              <input
                type="url"
                name="button_url"
                value={formData.button_url}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
          </>
        );

      case 'newsletter_form':
        return (
          <>
            {baseFields}
            {renderImageUpload('image_url', 'Sol Görsel')}
            <div className="form-group">
              <label>İçerik</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="4"
                placeholder="Newsletter formu açıklaması..."
              />
            </div>
          </>
        );

      case 'countdown_timer':
        return (
          <>
            {baseFields}
            {renderImageUpload('background_image_url', 'Arka Plan Görseli', true)}
            <div className="form-group">
              <label>Geri Sayım Tarihi *</label>
              <input
                type="datetime-local"
                name="countdown_date"
                value={formData.countdown_date}
                onChange={handleInputChange}
                className={errors.countdown_date ? 'error' : ''}
              />
              {errors.countdown_date && <span className="error-message">{errors.countdown_date}</span>}
            </div>
            <div className="form-group">
              <label>İçerik</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="4"
                placeholder="Geri sayım açıklaması..."
              />
            </div>
          </>
        );

      case 'countdown_image':
        return (
          <>
            {baseFields}
            {renderImageUpload('image_url', 'Sol Görsel')}
            <div className="form-group">
              <label>Geri Sayım Tarihi *</label>
              <input
                type="datetime-local"
                name="countdown_date"
                value={formData.countdown_date}
                onChange={handleInputChange}
                className={errors.countdown_date ? 'error' : ''}
              />
              {errors.countdown_date && <span className="error-message">{errors.countdown_date}</span>}
            </div>
            <div className="form-group">
              <label>İçerik</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="4"
                placeholder="Geri sayım açıklaması..."
              />
            </div>
          </>
        );

      default:
        return baseFields;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{announcement ? 'Duyuru Düzenle' : 'Yeni Duyuru'}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {renderFormFields()}

          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : (announcement ? 'Güncelle' : 'Oluştur')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;
