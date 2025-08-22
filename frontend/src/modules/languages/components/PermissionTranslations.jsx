import React from 'react';
import { Card, Empty } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

const PermissionTranslations = ({ currentLanguage, onSuccess, onError }) => {
  return (
    <Card title="Yetki Çevirileri" className="translations-card">
      <Empty
        image={<SafetyCertificateOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description="Yetki çevirileri yakında eklenecek"
      />
    </Card>
  );
};

export default PermissionTranslations;
