import React, { useState, useEffect } from 'react';
import { Table, Switch, Card, Row, Col, Typography } from 'antd';

const { Title } = Typography;

const PermissionsTable = ({ businessId }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const resources = [
    { key: 'products', name: 'Ürünler' },
    { key: 'categories', name: 'Kategoriler' },
    { key: 'users', name: 'Kullanıcılar' },
    { key: 'branches', name: 'Şubeler' },
    { key: 'qr', name: 'QR Kodlar' },
    { key: 'campaigns', name: 'Kampanyalar' },
    { key: 'tables', name: 'Masalar' },
  ];

  const actions = [
    { key: 'read', name: 'Görüntüleme' },
    { key: 'create', name: 'Oluşturma' },
    { key: 'update', name: 'Düzenleme' },
    { key: 'delete', name: 'Silme' },
  ];

  const roles = [
    { key: 'super_admin', name: 'Süper Admin' },
    { key: 'admin', name: 'Admin' },
    { key: 'manager', name: 'Manager' },
  ];

  // Fonksiyonu yukarı taşıdık
  const getDefaultPermission = (role, resource, action) => {
    const defaults = {
      admin: {
        products: ['read', 'create', 'update', 'delete'],
        categories: ['read', 'create', 'update', 'delete'],
        users: ['read', 'create', 'update', 'delete'],
        branches: ['read', 'create', 'update', 'delete'],
        qr: ['read', 'create', 'update', 'delete'],
        campaigns: ['read', 'create', 'update', 'delete'],
      },
      manager: {
        products: ['read'],
        branches: ['read'],
        qr: ['read'],
        tables: ['read', 'create', 'update', 'delete'],
      }
    };
    
    return defaults[role]?.[resource]?.includes(action) || false;
  };

  const columns = [
    {
      title: 'Kaynak',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: 'İşlem',
      dataIndex: 'action',
      key: 'action',
    },
    ...roles.map(role => ({
      title: role.name,
      dataIndex: role.key,
      key: role.key,
      render: (checked, record) => (
        <Switch
          checked={checked}
          onChange={(checked) => handlePermissionChange(role.key, record.resourceKey, record.actionKey, checked)}
        />
      ),
    })),
  ];

  const data = resources.flatMap(resource =>
    actions.map(action => ({
      key: `${resource.key}-${action.key}`,
      resource: resource.name,
      action: action.name,
      resourceKey: resource.key,
      actionKey: action.key,
      super_admin: true, // Süper admin her şeyi yapabilir
      admin: getDefaultPermission('admin', resource.key, action.key),
      manager: getDefaultPermission('manager', resource.key, action.key),
    }))
  );

  const handlePermissionChange = async (role, resource, action, enabled) => {
    // API'ye yetki değişikliğini gönder
    console.log(`${role} - ${resource} - ${action} - ${enabled}`);
  };

  return (
    <div>
      <Title level={3}>Yetkilendirmeler</Title>
      <Card>
        <Table
                scroll={{x: 900, y: 400 }}  // Y scroll'u ekledik

          dataSource={data}
          columns={columns}
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default PermissionsTable; 