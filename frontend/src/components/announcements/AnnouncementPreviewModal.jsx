import React, { useState } from 'react';
import { Modal } from 'antd';
import '../css/announcementPreviewModal.css';

const AnnouncementPreviewModal = ({ visible, onClose, announcement }) => {
  const [imageFitMode, setImageFitMode] = useState('cover'); // 'cover', 'contain', 'scale-down'

  if (!announcement) return null;

  const getImageFitClass = () => {
    switch (imageFitMode) {
      case 'contain': return 'contain-fit';
      case 'scale-down': return 'scale-down';
      default: return '';
    }
  };

  const toggleImageFit = () => {
    const modes = ['cover', 'contain', 'scale-down'];
    const currentIndex = modes.indexOf(imageFitMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setImageFitMode(modes[nextIndex]);
  };

  const renderVisualOnly = () => (
    <div className="preview-visual-only">
      <div className="image-container">
        <img 
          src={`http://localhost:5000/images/${announcement.image_url}`} 
          alt={announcement.title}
          className={`preview-image ${getImageFitClass()}`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="preview-image-placeholder" style={{ display: 'none' }}>
          📷 Görsel Yüklenemedi
        </div>
      </div>
    </div>
  );

  const renderVisualText = () => (
    <div className="preview-visual-text">
      <div className="image-container">
        <img 
          src={`http://localhost:5000/images/${announcement.image_url}`} 
          alt={announcement.title}
          className={`preview-image ${getImageFitClass()}`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="preview-image-placeholder" style={{ display: 'none' }}>
          📷 Görsel Yüklenemedi
        </div>
      </div>
      <div className="preview-content">
        <h3>{announcement.title}</h3>
        <p>{announcement.content}</p>
      </div>
    </div>
  );

  const renderSubscriptionForm = () => (
    <div className="preview-subscription-form">
      <div 
        className="preview-background"
        style={{
          backgroundImage: announcement.background_image_url 
            ? `url(http://localhost:5000/images/${announcement.background_image_url})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="preview-overlay">
          <h2>{announcement.title}</h2>
          <p>{announcement.content}</p>
          <form className="preview-form">
            <input type="email" placeholder="E-posta adresiniz" />
            <button type="submit" className="preview-button">
              Abone Ol
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderTextImageButton = () => (
    <div className="preview-text-image-button">
      <div className="image-container">
        <img 
          src={`http://localhost:5000/images/${announcement.image_url}`} 
          alt={announcement.title}
          className={`preview-image ${getImageFitClass()}`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="preview-image-placeholder" style={{ display: 'none' }}>
          📷 Görsel Yüklenemedi
        </div>
      </div>
      <div className="preview-right">
        <h3>{announcement.title}</h3>
        <p>{announcement.content}</p>
        {announcement.button_text && (
          <button 
            className="preview-button"
            style={{ backgroundColor: announcement.button_color }}
          >
            {announcement.button_text}
          </button>
        )}
      </div>
    </div>
  );

  const renderNewsletterForm = () => (
    <div className="preview-newsletter-form">
      <div className="image-container">
        <img 
          src={`http://localhost:5000/images/${announcement.image_url}`} 
          alt={announcement.title}
          className={`preview-image ${getImageFitClass()}`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="preview-image-placeholder" style={{ display: 'none' }}>
          📷 Görsel Yüklenemedi
        </div>
      </div>
      <div className="preview-right">
        <h3>{announcement.title}</h3>
        <p>{announcement.content}</p>
        <form className="preview-form">
          <input type="text" placeholder="Adınız" />
          <input type="email" placeholder="E-posta" />
          <button type="submit" className="preview-button">
            Newsletter'a Katıl
          </button>
        </form>
      </div>
    </div>
  );

  const renderCountdownTimer = () => (
    <div className="preview-countdown-timer">
      <div 
        className="preview-background"
        style={{
          backgroundImage: announcement.background_image_url 
            ? `url(http://localhost:5000/images/${announcement.background_image_url})`
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        }}
      >
        <div className="preview-overlay">
          <h2>{announcement.title}</h2>
          <p>{announcement.content}</p>
          <div className="preview-countdown">
            <div className="countdown-item">
              <span className="countdown-number">00</span>
              <span className="countdown-label">Gün</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">00</span>
              <span className="countdown-label">Saat</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">00</span>
              <span className="countdown-label">Dakika</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">00</span>
              <span className="countdown-label">Saniye</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCountdownImage = () => (
    <div className="preview-countdown-image">
      <div className="image-container">
        <img 
          src={`http://localhost:5000/images/${announcement.image_url}`} 
          alt={announcement.title}
          className={`preview-image ${getImageFitClass()}`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="preview-image-placeholder" style={{ display: 'none' }}>
          📷 Görsel Yüklenemedi
        </div>
      </div>
      <div className="preview-right">
        <h3>{announcement.title}</h3>
        <p>{announcement.content}</p>
        <div className="preview-countdown">
          <div className="countdown-item">
            <span className="countdown-number">00</span>
            <span className="countdown-label">Gün</span>
          </div>
          <div className="countdown-item">
            <span className="countdown-number">00</span>
            <span className="countdown-label">Saat</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (announcement.category) {
      case 'visual_only':
        return renderVisualOnly();
      case 'visual_text':
        return renderVisualText();
      case 'subscription_form':
        return renderSubscriptionForm();
      case 'text_image_button':
        return renderTextImageButton();
      case 'newsletter_form':
        return renderNewsletterForm();
      case 'countdown_timer':
        return renderCountdownTimer();
      case 'countdown_image':
        return renderCountdownImage();
      default:
        return <div>Önizleme bulunamadı</div>;
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Duyuru Önizlemesi</span>
          <button 
            onClick={toggleImageFit}
            style={{
              padding: '4px 8px 10px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              background: '#fff',
              cursor: 'pointer',
              marginRight: '30px' // Added right margin
            }}
            title={`Görsel Kalitesi: ${imageFitMode === 'cover' ? 'Kırpma' : imageFitMode === 'contain' ? 'Tam Görünüm' : 'Ölçekleme'}`}
          >
            {imageFitMode === 'cover' ? '✂️' : imageFitMode === 'contain' ? '🔍' : '📏'}
          </button>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
    >
      <div className="preview-container">
        <div className="phone-template">
          <div className="phone-header">
            <div className="phone-notch"></div>
          </div>
          <div className="phone-screen">
            <div className="preview-content-wrapper">
              {renderPreview()}
            </div>
          </div>
          <div className="phone-home-indicator"></div>
        </div>

        <div className="preview-info">
          <h4>Duyuru Bilgileri</h4>
          <p><strong>Başlık:</strong> {announcement.title}</p>
          <p><strong>Kategori:</strong> {announcement.category}</p>
          <p><strong>Durum:</strong> {announcement.is_active ? 'Aktif' : 'Pasif'}</p>
          {announcement.start_date && (<p><strong>Başlangıç:</strong> {new Date(announcement.start_date).toLocaleDateString('tr-TR')}</p>)}
          {announcement.end_date && (<p><strong>Bitiş:</strong> {new Date(announcement.end_date).toLocaleDateString('tr-TR')}</p>)}
        </div>
      </div>
    </Modal>
  );
};

export default AnnouncementPreviewModal;
