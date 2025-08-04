import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;
const API_URL = import.meta.env.VITE_API_URL;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        // Token ve kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        message.success('Giriş başarılı!');
        onLogin(data.user);
      } else {
        message.error(data.error || 'Giriş başarısız!');
      }
    } catch (error) {
      message.error('Bağlantı hatası!');
      console.error('Login hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>QR Menu Admin</Title>
          <p>Giriş yapın</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email gerekli!' },
              { type: 'email', message: 'Geçerli bir email girin!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email adresiniz" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Şifre"
            rules={[{ required: true, message: 'Şifre gerekli!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Şifreniz" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              Giriş Yap
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p><strong>Test Kullanıcıları:</strong></p>
          <p>superadmin@test.com (Süper Admin)</p>
          <p>admin@test.com (Admin)</p>
          <p>manager@test.com (Manager)</p>
          <p><strong>Şifre:</strong> 123456</p>
        </div>
      </Card>
    </div>
  );
};

export default Login; 