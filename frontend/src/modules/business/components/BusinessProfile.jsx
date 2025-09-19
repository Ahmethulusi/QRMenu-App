import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Upload,
  Space,
  Divider,
  Row,
  Col,
  Card,
  message,
  Modal,
  Spin,
  TimePicker,
  Checkbox
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  ReloadOutlined,
  ShopOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  InstagramOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  YoutubeOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TagOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { useBusiness } from '../hooks/useBusiness';
import OpeningHours from './OpeningHours';
import '../css/BusinessProfile.css';

const { TextArea } = Input;
const { confirm } = Modal;

const BusinessProfile = () => {
  const [form] = Form.useForm();
  const {
    businessProfile,
    loading,
    uploading,
    updateBusinessProfile,
    uploadLogo,
    uploadBannerImages,
    deleteLogo,
    deleteBannerImage,
    uploadWelcomeBackground,
    deleteWelcomeBackground
  } = useBusiness();

  const [logoFileList, setLogoFileList] = useState([]);
  const [bannerFileList, setBannerFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Form'u business profile ile doldur
  useEffect(() => {
    if (businessProfile) {
      form.setFieldsValue({
        name: businessProfile.name,
        custom_domain: businessProfile.custom_domain,
        website_url: businessProfile.website_url,
        instagram_url: businessProfile.instagram_url,
        facebook_url: businessProfile.facebook_url,
        twitter_url: businessProfile.twitter_url,
        linkedin_url: businessProfile.linkedin_url,
        youtube_url: businessProfile.youtube_url,
        phone: businessProfile.phone,
        email: businessProfile.email,
        address: businessProfile.address,
        about_text: businessProfile.about_text,
        slogan: businessProfile.slogan,
        opening_hours: businessProfile.opening_hours
      });
    }
  }, [businessProfile, form]);

  // Form submit
  const onFinish = async (values) => {
    await updateBusinessProfile(values);
  };

  // Logo upload
  const handleLogoUpload = async (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Sadece resim dosyaları yükleyebilirsiniz!');
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Resim boyutu 2MB\'dan küçük olmalıdır!');
      return false;
    }

    await uploadLogo(file);
    return false; // Prevent default upload
  };

  // Banner images upload
  const handleBannerUpload = async ({ fileList }) => {
    const newFiles = fileList.filter(file => !file.url && file.originFileObj);
    
    if (newFiles.length > 0) {
      const files = newFiles.map(file => file.originFileObj);
      
      // Validate files
      for (const file of files) {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
          message.error('Sadece resim dosyaları yükleyebilirsiniz!');
          return;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          message.error('Resim boyutu 5MB\'dan küçük olmalıdır!');
          return;
        }
      }

      await uploadBannerImages(files);
    }
    
    setBannerFileList(fileList);
  };

  // Delete logo
  const handleDeleteLogo = () => {
    confirm({
      title: 'Logo\'yu silmek istediğinizden emin misiniz?',
      content: 'Bu işlem geri alınamaz.',
      okText: 'Evet, Sil',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        await deleteLogo();
      }
    });
  };

  // Delete banner image
  const handleDeleteBannerImage = (imagePath) => {
    confirm({
      title: 'Bu banner görselini silmek istediğinizden emin misiniz?',
      content: 'Bu işlem geri alınamaz.',
      okText: 'Evet, Sil',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        await deleteBannerImage(imagePath);
      }
    });
  };

  // Welcome background upload
  const handleWelcomeBackgroundUpload = async (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Sadece resim dosyaları yükleyebilirsiniz!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Resim boyutu 5MB\'dan küçük olmalıdır!');
      return false;
    }

    await uploadWelcomeBackground(file);
    return false; // Prevent default upload
  };

  // Delete welcome background
  const handleDeleteWelcomeBackground = () => {
    confirm({
      title: 'Welcome background\'u silmek istediğinizden emin misiniz?',
      content: 'Bu işlem geri alınamaz.',
      okText: 'Evet, Sil',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        await deleteWelcomeBackground();
      }
    });
  };

  // Preview image
  const handlePreview = (imagePath, isLogo = false, isWelcomeBackground = false) => {
    let basePath = '/images/banners/';
    if (isLogo) basePath = '/logos/';
    if (isWelcomeBackground) basePath = '/images/welcome_backgrounds/';
    
    setPreviewImage(`${VITE_API_URL}${basePath}${imagePath}`);
    setPreviewVisible(true);
  };

  if (loading && !businessProfile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>İşletme profili yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="business-profile-container">
      <div className="business-profile-header">
        <h1 className="business-profile-title">
          <ShopOutlined className="section-icon" />
          İşletme Profili
        </h1>
        <p className="business-profile-description">
          İşletmenizin QR menüsünde görünecek bilgilerini buradan düzenleyebilirsiniz.
        </p>
      </div>

      <div className="business-profile-content">

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={loading}
      >
        {/* Temel Bilgiler */}
        <div className="profile-form-section">
          <h3 className="section-title">
            <ShopOutlined className="section-icon" />
            Temel Bilgiler
          </h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="İşletme Adı"
                name="name"
                rules={[{ required: true, message: 'İşletme adı gereklidir!' }]}
              >
                <Input placeholder="İşletme adınızı girin" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Özel Domain"
                name="custom_domain"
              >
                <Input placeholder="ornek.com" />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Logo Yükleme */}
        <div className="profile-form-section">
          <h3 className="section-title">
            <ShopOutlined className="section-icon" />
            Logo
          </h3>
          <Card className="logo-upload-section">
            {businessProfile?.logo ? (
              <div className="logo-preview">
                <img
                  src={`${VITE_API_URL}/logos/${businessProfile.logo}`}
                  alt="Business Logo"
                  className="logo-image"
                />
                <div className="logo-actions">
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(businessProfile.logo, true)}
                  >
                    Önizle
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined style={{ color: 'white' }} />}
                    onClick={handleDeleteLogo}
                    loading={loading}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p><UploadOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} /></p>
                <p className="upload-text">Logo yüklemek için tıklayın</p>
                <p className="upload-hint">Önerilen boyut: 200x120px, Max: 2MB</p>
              </div>
            )}
            
            <Upload
              beforeUpload={handleLogoUpload}
              showUploadList={false}
              accept="image/*"
              disabled={uploading}
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={uploading}
                style={{ marginTop: '16px' }}
              >
                {businessProfile?.logo ? 'Logo Değiştir' : 'Logo Yükle'}
              </Button>
            </Upload>
          </Card>
        </div>

        {/* Banner Görselleri */}
        <div className="profile-form-section">
          <h3 className="section-title">
            <GlobalOutlined className="section-icon" />
            Banner Görselleri
          </h3>
          

          <Card className="banner-upload-section">
            <Upload
              multiple
              listType="picture-card"
              fileList={bannerFileList}
              onChange={handleBannerUpload}
              beforeUpload={() => false} // Prevent auto upload
              accept="image/*"
              disabled={uploading}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Banner Ekle</div>
              </div>
            </Upload>
            
            {businessProfile?.banner_images && businessProfile.banner_images.length > 0 && (
              <div className="banner-preview-grid">
                {businessProfile.banner_images.map((image, index) => (
                  <div key={index} className="banner-item">
                    <img
                      src={`${VITE_API_URL}/images/banners/${image}`}
                      alt={`Banner ${index + 1}`}
                      className="banner-image"
                    />
                    <div className="banner-actions">
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handlePreview(image)}
                      />
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined style={{ color: 'white' }} />}
                        onClick={() => handleDeleteBannerImage(image)}
                        loading={loading}
                        className="banner-delete-btn"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <p className="upload-hint" style={{ textAlign: 'center', marginTop: '16px' }}>
              Önerilen boyut: 1200x400px, Max: 5MB, En fazla 5 görsel
            </p>
          </Card>
        </div>

        {/* Sosyal Medya Linkleri */}
        <div className="profile-form-section">
          <h3 className="section-title">
            <GlobalOutlined className="section-icon" />
            Sosyal Medya Hesapları
          </h3>
          <div className="social-media-grid">
            <div className="social-media-item">
              <InstagramOutlined className="social-icon instagram-icon" />
              <Form.Item name="instagram_url" style={{ margin: 0, flex: 1 }}>
                <Input placeholder="Instagram profil URL" />
              </Form.Item>
            </div>
            
            <div className="social-media-item">
              <FacebookOutlined className="social-icon facebook-icon" />
              <Form.Item name="facebook_url" style={{ margin: 0, flex: 1 }}>
                <Input placeholder="Facebook sayfa URL" />
              </Form.Item>
            </div>
            
            <div className="social-media-item">
              <TwitterOutlined className="social-icon twitter-icon" />
              <Form.Item name="twitter_url" style={{ margin: 0, flex: 1 }}>
                <Input placeholder="Twitter/X profil URL" />
              </Form.Item>
            </div>
            
            <div className="social-media-item">
              <LinkedinOutlined className="social-icon linkedin-icon" />
              <Form.Item name="linkedin_url" style={{ margin: 0, flex: 1 }}>
                <Input placeholder="LinkedIn profil URL" />
              </Form.Item>
            </div>
            
            <div className="social-media-item">
              <YoutubeOutlined className="social-icon youtube-icon" />
              <Form.Item name="youtube_url" style={{ margin: 0, flex: 1 }}>
                <Input placeholder="YouTube kanal URL" />
              </Form.Item>
            </div>
            
            <div className="social-media-item">
              <GlobalOutlined className="social-icon website-icon" />
              <Form.Item name="website_url" style={{ margin: 0, flex: 1 }}>
                <Input placeholder="Web sitesi URL" />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="profile-form-section">
          <h3 className="section-title">
            <PhoneOutlined className="section-icon" />
            İletişim Bilgileri
          </h3>
          <div className="contact-info-grid">
            <Form.Item
              label="Telefon"
              name="phone"
            >
              <Input prefix={<PhoneOutlined />} placeholder="Telefon numarası" />
            </Form.Item>
            
            <Form.Item
              label="E-posta"
              name="email"
              rules={[{ type: 'email', message: 'Geçerli bir e-posta adresi girin!' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="E-posta adresi" />
            </Form.Item>
          </div>
          
          <Form.Item
            label="Adres"
            name="address"
          >
            <TextArea
              rows={3}
              placeholder="İşletme adresi"
              prefix={<EnvironmentOutlined />}
            />
          </Form.Item>
        </div>

        {/* Hakkımızda ve Slogan */}
        <div className="profile-form-section">
          <h3 className="section-title">
            <FileTextOutlined className="section-icon" />
            İşletme Bilgileri
          </h3>
          
          <Form.Item
            label="Slogan"
            name="slogan"
          >
            <Input prefix={<TagOutlined />} placeholder="İşletmenizin sloganı" />
          </Form.Item>
          
          <Form.Item
            label="Hakkımızda"
            name="about_text"
          >
            <TextArea
              rows={4}
              placeholder="İşletmeniz hakkında detaylı bilgi"
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </div>

        {/* Açılış Saatleri */}
        <div className="profile-form-section">
          <h3 className="section-title">
            <ClockCircleOutlined className="section-icon" />
            Açılış Saatleri
          </h3>
          
          <Form.Item name="opening_hours">
            <OpeningHours />
          </Form.Item>
        </div>

        {/* Welcome Background */}
        <div className="profile-form-section">
          <h3 className="section-title">
            <PictureOutlined className="section-icon" />
            Welcome Screen Arka Plan
          </h3>
          <Card className="welcome-background-upload-section">
            {businessProfile?.welcome_background ? (
              <div className="welcome-background-preview">
                <img
                  src={`${VITE_API_URL}/images/welcome_backgrounds/${businessProfile.welcome_background}`}
                  alt="Welcome Background"
                  className="welcome-background-image"
                />
                <div className="welcome-background-actions">
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(businessProfile.welcome_background, false, true)}
                  >
                    Önizle
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined style={{ color: 'white' }} />}
                    onClick={handleDeleteWelcomeBackground}
                    loading={loading}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p><UploadOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} /></p>
                <p className="upload-text">Welcome screen arka plan görseli yüklemek için tıklayın</p>
                <p className="upload-hint">Önerilen boyut: 1080x1920px (9:16), Max: 5MB</p>
              </div>
            )}
            
            <Upload
              beforeUpload={handleWelcomeBackgroundUpload}
              showUploadList={false}
              accept="image/*"
              disabled={uploading}
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={uploading}
                style={{ marginTop: '16px' }}
              >
                {businessProfile?.welcome_background ? 'Arka Plan Değiştir' : 'Arka Plan Yükle'}
              </Button>
            </Upload>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <Space size="middle">
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={() => form.resetFields()}
              disabled={loading}
            >
              Sıfırla
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </Form>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title="Görsel Önizleme"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
      </div>
    </div>
  );
};

export default BusinessProfile;
