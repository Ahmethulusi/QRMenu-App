import React from 'react';
import { Card, Empty } from 'antd';
import { BankOutlined } from '@ant-design/icons';

const BusinessTranslations = ({ currentLanguage, onSuccess, onError }) => {
  return (
    <Card title="İşletme Çevirileri" className="translations-card">
      <Empty
        image={<BankOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description="İşletme çevirileri yakında eklenecek"
      />
    </Card>
  );
};

export default BusinessTranslations;
