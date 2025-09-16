import React from 'react';
import { Typography, Card, Alert } from 'antd';

const { Title, Paragraph } = Typography;

const DesignSettings = () => {
  return (
    <div className="design-settings">
      <Title level={2}>QR Tasarım Ayarları</Title>
      
      <Card style={{ marginBottom: 20 }}>
        <Alert
          message="Geliştirme Aşamasında"
          description="QR Tasarım Ayarları modülü şu anda geliştirme aşamasındadır. Yakında kullanıma sunulacaktır."
          type="info"
          showIcon
        />
        
        <Paragraph style={{ marginTop: 16 }}>
          Bu modül ile QR kodlarınızın tasarım ayarlarını yönetebileceksiniz:
        </Paragraph>
        
        <ul>
          <li>Varsayılan renk ayarları</li>
          <li>Logo ekleme ve boyutlandırma</li>
          <li>Köşe yuvarlama ve stil seçenekleri</li>
          <li>QR kod şablonları</li>
        </ul>
      </Card>
    </div>
  );
};

export default DesignSettings;
