import React from 'react';
import { Card, Empty } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';

const AnnouncementTranslations = ({ currentLanguage, onSuccess, onError }) => {
  return (
    <Card title="Duyuru Çevirileri" className="translations-card">
      <Empty
        image={<NotificationOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description="Duyuru çevirileri yakında eklenecek"
      />
    </Card>
  );
};

export default AnnouncementTranslations;
