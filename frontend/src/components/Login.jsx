import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Tabs, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

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

  const onRegisterFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
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
        
        message.success('Kayıt başarılı! Giriş yapıldı.');
        onLogin(data.user);
      } else {
        message.error(data.error || 'Kayıt başarısız!');
      }
    } catch (error) {
      message.error('Bağlantı hatası!');
      console.error('Register hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'login',
      label: 'Giriş Yap',
      children: (
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
      ),
    },
    {
      key: 'register',
      label: 'Yeni Hesap Oluştur',
      children: (
        <Form
          name="register"
          onFinish={onRegisterFinish}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Ad Soyad"
            rules={[{ required: true, message: 'Ad soyad gerekli!' }]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="Adınız ve soyadınız" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email gerekli!' },
              { type: 'email', message: 'Geçerli bir email girin!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email adresiniz" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Şifre"
            rules={[
              { required: true, message: 'Şifre gerekli!' },
              { min: 6, message: 'Şifre en az 6 karakter olmalı!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Şifreniz" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Rol seçiniz!' }]}
          >
            <Select placeholder="Rol seçin" size="large">
              <Option value="manager">Manager</Option>
              <Option value="admin">Admin</Option>
              <Option value="super_admin">Süper Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="business_id"
            label="İşletme ID"
            rules={[{ required: true, message: 'İşletme ID gerekli!' }]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="İşletme ID (örn: 1)" 
              size="large"
              type="number"
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
              Hesap Oluştur
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 450, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>QR Menu Admin</Title>
          <p>Hesabınıza giriş yapın veya yeni hesap oluşturun</p>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={items}
          centered
        />

        {activeTab === 'login' && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <p><strong>Test Kullanıcıları:</strong></p>
            <p>superadmin@test.com (Süper Admin)</p>
            <p>admin@test.com (Admin)</p>
            <p>manager@test.com (Manager)</p>
            <p><strong>Şifre:</strong> 123456</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;