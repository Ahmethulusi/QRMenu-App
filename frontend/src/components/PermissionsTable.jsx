import React, { useState, useEffect } from 'react';
import { Table, Switch, Card, Row, Col, Typography, message, Select } from 'antd';
import { getRolePermissionsAPI, updateRolePermissionsAPI } from '../utils/api';

const { Title } = Typography;
const { Option } = Select;

const PermissionsTable = ({ businessId }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('manager');
  const [rolePermissions, setRolePermissions] = useState({});

  const resources = [
    { key: 'products', label: 'Ürünler' },
    { key: 'categories', label: 'Kategoriler' },
    { key: 'users', label: 'Kullanıcılar' },
    { key: 'branches', label: 'Şubeler' },
    { key: 'qr', label: 'QR Kodlar' },
    { key: 'permissions', label: 'Yetkiler' }
  ];

  const actions = [
    { key: 'read', label: 'Görüntüleme' },
    { key: 'create', label: 'Oluşturma' },
    { key: 'update', label: 'Güncelleme' },
    { key: 'delete', label: 'Silme' }
  ];

  // Yetkileri yükle
  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await getRolePermissionsAPI(selectedRole, businessId);
      setPermissions(data);
      
      // Role permissions state'ini güncelle
      const permissionsMap = {};
      data.forEach(perm => {
        const key = `${perm.resource}_${perm.action}`;
        permissionsMap[key] = perm.is_active;
      });
      setRolePermissions(permissionsMap);
      
    } catch (error) {
      message.error('Yetkiler yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Rol değiştiğinde yetkileri yeniden yükle
  useEffect(() => {
    loadPermissions();
  }, [selectedRole, businessId]);

  // Yetki değişikliği
  const handlePermissionChange = async (resource, action, checked) => {
    try {
      const key = `${resource}_${action}`;
      const updatedPermissions = { ...rolePermissions, [key]: checked };
      setRolePermissions(updatedPermissions);

      // SADECE DEĞİŞEN YETKİYİ GÖNDER
      const changedPermission = {
        resource: resource,
        action: action,
        hasPermission: checked
      };

      console.log('🔄 Değişen yetki:', changedPermission);

      await updateRolePermissionsAPI(selectedRole, [changedPermission], businessId);
      message.success('Yetki güncellendi');
      
    } catch (error) {
      message.error('Yetki güncellenemedi: ' + error.message);
      // Hata durumunda eski haline geri döndür
      const key = `${resource}_${action}`;
      setRolePermissions(prev => ({ ...prev, [key]: !checked }));
    }
  };

  // Tablo kolonları
  const columns = [
    {
      title: 'Kaynak',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource) => {
        const resourceObj = resources.find(r => r.key === resource);
        return resourceObj ? resourceObj.label : resource;
      }
    },
    {
      title: 'İşlem',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        const actionObj = actions.find(a => a.key === action);
        return actionObj ? actionObj.label : action;
      }
    },
    {
      title: 'Yetki',
      key: 'permission',
      render: (_, record) => {
        const key = `${record.resource}_${record.action}`;
        const hasPermission = rolePermissions[key] || false;
        
        return (
          <Switch
            checked={hasPermission}
            onChange={(checked) => handlePermissionChange(record.resource, record.action, checked)}
            checkedChildren="Var"
            unCheckedChildren="Yok"
          />
        );
      }
    }
  ];

  return (
    <Card>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Title level={4}>Rol Yetkileri</Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Select
            value={selectedRole}
            onChange={setSelectedRole}
            style={{ width: 200 }}
            placeholder="Rol seçin"
          >
            <Option value="manager">Manager</Option>
            <Option value="admin">Admin</Option>
            <Option value="super_admin">Super Admin</Option>
          </Select>
        </Col>
      </Row>
      
      <Table
        columns={columns}
        scroll={{x: 900, y: 400 }}

        dataSource={permissions}
        rowKey={(record) => `${record.resource}_${record.action}`}
        loading={loading}
        pagination={false}
      />
    </Card>
  );
};

export default PermissionsTable; 