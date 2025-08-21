import React from 'react';
import { Result, Button } from 'antd';
import { WarningOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const NoPermission = ({ 
  title = "Bu sayfaya erişim yetkiniz yok", 
  subTitle = "Bu işlemi gerçekleştirmek için gerekli yetkilere sahip değilsiniz.",
  showHomeButton = true 
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: '20px'
    }}>
      <Result
        icon={<WarningOutlined style={{ color: '#faad14' }} />}
        status="warning"
        title={title}
        subTitle={subTitle}
        extra={
          showHomeButton ? [
            <Button 
              type="primary" 
              icon={<HomeOutlined />} 
              onClick={handleGoHome}
              key="home"
              size="large"
            >
              Ana Sayfaya Dön
            </Button>
          ] : []
        }
        style={{
          maxWidth: '500px',
          textAlign: 'center'
        }}
      />
    </div>
  );
};

export default NoPermission;
