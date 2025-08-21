import React from 'react';
import {
  Card,
  Avatar,
  Button,
  Form,
  Input,
  Row,
  Col,
  Divider,
  Typography,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const dummyUser = {
  name: 'Ahmet Yılmaz',
  email: 'ahmet.yilmaz@example.com',
  role: 'Admin',
  joinedAt: '2023-12-15',
};

const ProfilePage = () => {
  const [form] = Form.useForm();

  return (
    <>
      {/* Sayfa genişliği için bir iç container */}
<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>       
   <Card bordered={false}>
          <Row gutter={32} align="middle">
            <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
              <Avatar
                size={100}  
                icon={<UserOutlined />}
                src={null}
                style={{ marginBottom: 16 }}
              />
              <Button type="primary" icon={<EditOutlined />}>
                Profili Düzenle
              </Button>
            </Col>

            <Col xs={24} sm={16}>
              <Title level={4}>Kullanıcı Bilgileri</Title>
              <p>
                <Text strong>Ad Soyad:</Text> {dummyUser.name}
              </p>
              <p>
                <Text strong>E-posta:</Text> {dummyUser.email}
              </p>
              <p>
                <Text strong>Rol:</Text> {dummyUser.role}
              </p>
              <p>
                <Text strong>Kayıt Tarihi:</Text> {dummyUser.joinedAt}
              </p>
            </Col>
          </Row>

          <Divider />

          <div style={{ marginTop: 32 }}>
            <Title level={4}>
              <LockOutlined style={{ marginRight: 8 }} />
              Şifreyi Değiştir
            </Title>

            <Form
              layout="vertical"
              form={form}
              style={{ marginTop: 16 }}
            >
              <Form.Item label="Eski Şifre" name="oldPassword">
                <Input.Password placeholder="Eski şifrenizi girin" />
              </Form.Item>

              <Form.Item label="Yeni Şifre" name="newPassword">
                <Input.Password placeholder="Yeni şifre belirleyin" />
              </Form.Item>

              <Form.Item label="Yeni Şifre (Tekrar)" name="confirmPassword">
                <Input.Password placeholder="Yeni şifreyi tekrar girin" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" block>
                  Şifreyi Güncelle
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
      </div>
</>  );
};

export default ProfilePage;
