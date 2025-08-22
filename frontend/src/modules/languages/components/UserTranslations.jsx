import React from 'react';
import { Card, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const UserTranslations = ({ currentLanguage, onSuccess, onError }) => {
  return (
    <Card title="Kullanıcı Çevirileri" className="translations-card">
      <Empty
        image={<UserOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description="Kullanıcı çevirileri yakında eklenecek"
      />
    </Card>
  );
};

export default UserTranslations;
