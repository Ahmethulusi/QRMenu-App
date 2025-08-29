import React from 'react';
import { Card, Row, Col, Typography, Divider, Button } from 'antd';
import { DatabaseOutlined, SyncOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ERP.css';

const { Title, Text } = Typography;

const ERP = () => {
  const navigate = useNavigate();

  const navigateToTest = () => {
    navigate('/erp/test');
  };

  const navigateToIntegration = () => {
    navigate('/erp/integration');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <DatabaseOutlined /> ERP Modülü
      </Title>
      
      <Text type="secondary">
        ERP sisteminizi test edin ve entegrasyonu gerçekleştirin.
      </Text>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            title={
              <span>
                <DatabaseOutlined /> ERP Test
              </span>
            }
            hoverable
            className="erp-card"
            actions={[
              <Button 
                type="primary" 
                icon={<SettingOutlined />}
                onClick={navigateToTest}
                block
              >
                ERP Test'e Git
              </Button>
            ]}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <DatabaseOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={4}>ERP Bağlantı Testi</Title>
              <Text type="secondary">
                SQL Server bağlantısını test edin ve ERP veritabanı yapısını kontrol edin.
              </Text>
            </div>
            
            <Divider />
            
            <div>
              <Text strong>Özellikler:</Text>
              <ul style={{ marginTop: '8px' }}>
                <li>Bağlantı testi</li>
                <li>Tablo yapısı kontrolü</li>
                <li>Örnek veri görüntüleme</li>
                <li>Özel sorgu testi</li>
              </ul>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <span>
                <SyncOutlined /> ERP Entegrasyon
              </span>
            }
            hoverable
            className="erp-card"
            actions={[
              <Button 
                type="primary" 
                icon={<SyncOutlined />}
                onClick={navigateToIntegration}
                block
              >
                ERP Entegrasyon'a Git
              </Button>
            ]}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <SyncOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4}>ERP Veri Senkronizasyonu</Title>
              <Text type="secondary">
                ERP'den kategorileri ve ürünleri senkronize edin.
              </Text>
            </div>
            
            <Divider />
            
            <div>
              <Text strong>Özellikler:</Text>
              <ul style={{ marginTop: '8px' }}>
                <li>Kategori senkronizasyonu</li>
                <li>Ürün senkronizasyonu</li>
                <li>Tam senkronizasyon</li>
                <li>Fiyat güncelleme</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="ℹ️ ERP Entegrasyon Süreci">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" title="1. Test" className="process-card">
              <Text>ERP Test modülünden bağlantıyı test edin</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="2. Konfigürasyon" className="process-card">
              <Text>Bağlantı ayarlarını yapılandırın</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="3. Senkronizasyon" className="process-card">
              <Text>ERP Entegrasyon modülünden veri çekin</Text>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ERP;
