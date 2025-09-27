import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import { userAPI } from '../../common/utils/api';
import { getCurrentUser, canPerformAction } from '../../common/utils/permissions';

const { Option } = Select;

const UsersTable = ({ businessId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [form] = Form.useForm();
  
  const currentUser = getCurrentUser();

  const fetchUsers = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const data = await userAPI.getAllUsers(businessId);
      
      // Business ID'ye göre filtreleme
      let filteredUsers = data.filter(user => user.business_id === businessId);
      
      // Rol bazlı filtreleme
      if (currentUser?.role === 'admin') {
        // Admin sadece admin ve manager rolleri görebilir, super_admin göremez
        filteredUsers = filteredUsers.filter(user => 
          user.role === 'admin' || user.role === 'manager'
        );
      } else if (currentUser?.role === 'manager') {
        // Manager sadece manager rolleri görebilir
        filteredUsers = filteredUsers.filter(user => user.role === 'manager');
      }
      // Super admin tüm kullanıcıları görebilir (filtreleme yok)
      
      setUsers(filteredUsers);
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
      // Silinecek kullanıcıyı bul
      const userToDelete = users.find(user => user.user_id === userId);
      
      // Rol bazlı silme sınırlaması
      if (currentUser?.role === 'admin' && userToDelete?.role === 'super_admin') {
        message.error('Süper admin kullanıcılarını silemezsiniz!');
        return;
      }
      
      await userAPI.deleteUser(userId);
      message.success('Kullanıcı silindi!');
      fetchUsers();
    } catch (error) {
      message.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handlePasswordChange = (userId) => {
    setSelectedUserId(userId);
    setPasswordModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // Rol değişikliği sınırlaması
        if (currentUser?.role === 'admin' && values.role === 'super_admin') {
          message.error('Admin kullanıcıları süper admin rolüne atayamaz!');
          return;
        }
        if (currentUser?.role === 'admin' && editingUser.role === 'super_admin') {
          message.error('Süper admin kullanıcılarını düzenleyemezsiniz!');
          return;
        }
        
        await userAPI.updateUser(editingUser.user_id, { ...values, business_id: businessId });
        message.success('Kullanıcı güncellendi!');
      } else {
        // Yeni kullanıcı oluştururken rol sınırlaması
        if (currentUser?.role === 'admin' && values.role === 'super_admin') {
          message.error('Admin kullanıcıları süper admin rolüne atayamaz!');
          return;
        }
        
        await userAPI.createUser({ ...values, business_id: businessId, password: '123456' });
        message.success('Kullanıcı oluşturuldu!');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (err) {
      message.error(err.message || 'İşlem başarısız!');
    }
  };

  const handlePasswordSubmit = async (values) => {
    try {
      await userAPI.updatePassword(selectedUserId, values.newPassword);
      message.success('Şifre güncellendi!');
      setPasswordModalVisible(false);
    } catch (err) {
      message.error(err.message || 'Şifre güncellenemedi!');
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
      render: (_, record) => {
        // Rol bazlı buton görünürlük kontrolü
        const canEdit = canPerformAction(currentUser, 'edit_user') && 
          !(currentUser?.role === 'admin' && record.role === 'super_admin');
        const canDelete = canPerformAction(currentUser, 'delete_user') && 
          !(currentUser?.role === 'admin' && record.role === 'super_admin');
        const canChangePassword = canPerformAction(currentUser, 'edit_user') && 
          !(currentUser?.role === 'admin' && record.role === 'super_admin');
        
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {canEdit && (
              <Button 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
                size="small"
              >
                Düzenle
              </Button>
            )}
            {canChangePassword && (
              <Button 
                icon={<KeyOutlined />} 
                onClick={() => handlePasswordChange(record.user_id)}
                size="small"
              >
                Şifre
              </Button>
            )}
            {canDelete && (
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
                  style={{
                    backgroundColor: '#ff4d4f',
                    borderColor: '#ff4d4f',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#ff7875';
                    e.target.style.borderColor = '#ff7875';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ff4d4f';
                    e.target.style.borderColor = '#ff4d4f';
                    e.target.style.color = 'white';
                  }}
                >
                  Sil
                </Button>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>Kullanıcı Yönetimi</h3>
        {canPerformAction(currentUser, 'create_user') && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
          >
            Yeni Kullanıcı
          </Button>
        )}
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="user_id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1000 }}
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
              {currentUser?.role === 'super_admin' && (
                <Option value="super_admin">Süper Admin</Option>
              )}
              {currentUser?.role === 'super_admin' && (
                <Option value="admin">Admin</Option>
              )}
              <Option value="manager">Manager</Option>
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