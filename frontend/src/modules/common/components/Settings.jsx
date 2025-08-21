import React, { useState } from 'react';
import { Card, Tabs, Select, Button, message, Space, Typography } from 'antd';
import { GlobalOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const Settings = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('tr');
  const [loading, setLoading] = useState(false);

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const handleLanguageChange = async (languageCode) => {
    setLoading(true);
    try {
      // Burada dil değişikliği için API çağrısı yapılabilir
      setSelectedLanguage(languageCode);
      
      // Dil değişikliğini localStorage'a kaydet
      localStorage.setItem('selectedLanguage', languageCode);
      
      message.success(`${languages.find(lang => lang.code === languageCode)?.name} diline geçildi!`);
      
      // Sayfayı yenile (dil değişikliğinin etkili olması için)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Dil değişikliği hatası:', error);
      message.error('Dil değişikliği yapılırken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Burada tüm ayarları kaydetmek için API çağrısı yapılabilir
      message.success('Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      console.error('Ayar kaydetme hatası:', error);
      message.error('Ayarlar kaydedilirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SettingOutlined style={{ marginRight: '12px' }} />
        Genel Ayarlar
      </Title>
      
      <Card>
        <Tabs defaultActiveKey="language" size="large">
          <TabPane 
            tab={
              <span>
                <GlobalOutlined />
                Dil Ayarları
              </span>
            } 
            key="language"
          >
            <div style={{ maxWidth: '600px' }}>
              <Title level={4}>Uygulama Dili</Title>
              <Text type="secondary">
                Uygulamanın görüntüleneceği dili seçin. Bu ayar tüm kullanıcılar için geçerli olacaktır.
              </Text>
              
              <div style={{ marginTop: '24px' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Mevcut Dil:</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Select
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        style={{ width: '300px' }}
                        loading={loading}
                        placeholder="Dil seçin"
                      >
                        {languages.map(language => (
                          <Option key={language.code} value={language.code}>
                            <Space>
                              <span>{language.flag}</span>
                              <span>{language.name}</span>
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Text strong>Seçili Dil:</Text>
                    <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                      <Space>
                        <span style={{ fontSize: '20px' }}>
                          {languages.find(lang => lang.code === selectedLanguage)?.flag}
                        </span>
                        <span>
                          {languages.find(lang => lang.code === selectedLanguage)?.name}
                        </span>
                      </Space>
                    </div>
                  </div>
                  
                  <div>
                    <Button 
                      type="primary" 
                      onClick={handleSaveSettings}
                      loading={loading}
                      icon={<SettingOutlined />}
                    >
                      Ayarları Kaydet
                    </Button>
                  </div>
                </Space>
              </div>
            </div>
          </TabPane>
          
          {/* Gelecekte eklenebilecek diğer ayar sekmeleri */}
          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                Gelişmiş Ayarlar
              </span>
            } 
            key="advanced"
            disabled
          >
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">Bu özellik yakında eklenecek...</Text>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings;
