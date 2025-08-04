import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';

const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;

const UsersTable = ({ businessId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users?business_id=${businessId}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        message.error('Beklenmeyen veri formatı!');
      }
    } catch (err) {
      message.error('Kullanıcılar alınamadı!');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [businessId]);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        message.success('Kullanıcı silindi!');
        fetchUsers();
      } else {
        const data = await res.json();
        message.error(data.error || 'Silme işlemi başarısız!');
      }
    } catch (err) {
      message.error('Silme işlemi başarısız!');
    }
  };

  const handlePasswordChange = (userId) => {
    setSelectedUserId(userId);
    setPasswordModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const url = editingUser 
        ? `${API_URL}/api/users/${editingUser.user_id}`
        : `${API_URL}/api/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser 
        ? { ...values, business_id: businessId }
        : { ...values, business_id: businessId, password: '123456' }; // Varsayılan şifre

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        message.success(editingUser ? 'Kullanıcı güncellendi!' : 'Kullanıcı oluşturuldu!');
        setModalVisible(false);
        fetchUsers();
      } else {
        const data = await res.json();
        message.error(data.error || 'İşlem başarısız!');
      }
    } catch (err) {
      message.error('İşlem başarısız!');
    }
  };

  const handlePasswordSubmit = async (values) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${selectedUserId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: values.newPassword }),
      });

      if (res.ok) {
        message.success('Şifre güncellendi!');
        setPasswordModalVisible(false);
      } else {
        const data = await res.json();
        message.error(data.error || 'Şifre güncellenemedi!');
      }
    } catch (err) {
      message.error('Şifre güncellenemedi!');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'red';
      case 'admin': return 'blue';
      case 'manager': return 'green';
      default: return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'super_admin': return 'Süper Admin';
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      default: return role;
    }
  };

  const columns = [
    {
      title: 'Ad Soyad',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            Düzenle
          </Button>
          <Button 
            icon={<KeyOutlined />} 
            onClick={() => handlePasswordChange(record.user_id)}
            size="small"
          >
            Şifre
          </Button>
          <Popconfirm
            title="Bu kullanıcıyı silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.user_id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              size="small"
            >
              Sil
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>Kullanıcı Yönetimi</h3>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
        >
          Yeni Kullanıcı
        </Button>
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="user_id"
        loading={loading}
        pagination={false}
      />

      {/* Kullanıcı Ekleme/Düzenleme Modal */}
      <Modal
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Ad Soyad"
            rules={[{ required: true, message: 'Ad soyad gerekli!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email gerekli!' },
              { type: 'email', message: 'Geçerli bir email girin!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Rol seçin!' }]}
          >
            <Select>
              <Option value="manager">Manager</Option>
              <Option value="admin">Admin</Option>
              <Option value="super_admin">Süper Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingUser ? 'Güncelle' : 'Oluştur'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Şifre Değiştirme Modal */}
      <Modal
        title="Şifre Değiştir"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handlePasswordSubmit}
        >
          <Form.Item
            name="newPassword"
            label="Yeni Şifre"
            rules={[
              { required: true, message: 'Yeni şifre gerekli!' },
              { min: 6, message: 'Şifre en az 6 karakter olmalı!' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Şifre Tekrar"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Şifre tekrarı gerekli!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Şifreler eşleşmiyor!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Şifreyi Güncelle
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersTable; 