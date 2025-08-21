import React, { useState, useEffect } from 'react';
import { Table, Switch, Card, Row, Col, Typography, message, Select, Button } from 'antd';
import { getRolePermissionsAPI, updateRolePermissionsAPI } from '../../common/utils/api';
import { usePermissions } from '../../common/hooks/usePermissions';

const { Title } = Typography;
const { Option } = Select;

const PermissionsTable = ({ businessId }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('manager');
  const [rolePermissions, setRolePermissions] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // İzin kontrolü
  const { hasPermission } = usePermissions();

  const resources = [
    { key: 'products', label: 'Ürünler' },
    { key: 'categories', label: 'Kategoriler' },
    { key: 'users', label: 'Kullanıcılar' },
    { key: 'branches', label: 'Şubeler' },
    { key: 'qrcodes', label: 'QR Kodlar' },
    { key: 'tables', label: 'Masalar' },
    { key: 'businesses', label: 'İşletmeler' },
    { key: 'permissions', label: 'Yetkiler' }
  ];

  const actions = [
    { key: 'read', label: 'Görüntüleme', description: 'Liste görüntüleme ve detay inceleme' },
    { key: 'create', label: 'Oluşturma', description: 'Yeni kayıt ekleme' },
    { key: 'update', label: 'Güncelleme', description: 'Mevcut kayıtları düzenleme' },
    { key: 'delete', label: 'Silme', description: 'Kayıtları kalıcı olarak silme' },
    { key: 'sort', label: 'Sıralama', description: 'Kayıtların sırasını değiştirme' },
    { key: 'image_upload', label: 'Resim Yükleme', description: 'Dosya yükleme işlemleri' },
    { key: 'bulk_update', label: 'Toplu Güncelleme', description: 'Birden fazla kaydı aynı anda güncelleme' }
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
      setHasChanges(false); // Değişiklikleri sıfırla
      
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

  // Yetki değişikliği - sadece local state'i güncelle
  const handlePermissionChange = (resource, action, checked) => {
    const key = `${resource}_${action}`;
    const updatedPermissions = { ...rolePermissions, [key]: checked };
    setRolePermissions(updatedPermissions);
    setHasChanges(true); // Değişiklik yapıldığını işaretle
  };

  // Tüm değişiklikleri kaydet
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      
      // Orijinal verileri al
      const originalPermissionsMap = {};
      permissions.forEach(perm => {
        const key = `${perm.resource}_${perm.action}`;
        originalPermissionsMap[key] = perm.is_active;
      });
      
      // Değişen yetkileri bul
      const changedPermissions = [];
      Object.keys(rolePermissions).forEach(key => {
        const [resource, action] = key.split('_');
        const newValue = rolePermissions[key];
        const originalValue = originalPermissionsMap[key];
        
        if (newValue !== originalValue) {
          changedPermissions.push({
            resource: resource,
            action: action,
            hasPermission: newValue
          });
        }
      });
      
      if (changedPermissions.length === 0) {
        message.info('Değişiklik bulunamadı');
        return;
      }
      
      console.log('🔄 Kaydedilecek değişiklikler:', changedPermissions);
      
      // Tüm değişiklikleri tek seferde gönder
      await updateRolePermissionsAPI(selectedRole, changedPermissions, businessId);
      message.success(`${changedPermissions.length} yetki başarıyla güncellendi`);
      
      // Orijinal verileri yeniden yükle
      await loadPermissions();
      
    } catch (error) {
      message.error('Yetkiler kaydedilemedi: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Değişiklikleri iptal et
  const handleCancelChanges = () => {
    loadPermissions(); // Orijinal verileri yeniden yükle
  };

  // İzin kontrolü için değişken
  const canUpdatePermissions = hasPermission('permissions', 'update');

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
        if (actionObj) {
          return (
            <div>
              <div style={{ fontWeight: 'bold' }}>{actionObj.label}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                {actionObj.description}
              </div>
            </div>
          );
        }
        return action;
      }
    },
    {
      title: 'Yetki',
      key: 'permission',
      render: (_, record) => {
        const key = `${record.resource}_${record.action}`;
        const hasRecordPermission = rolePermissions[key] || false;
        
        return (
          <Switch
            checked={hasRecordPermission}
            onChange={(checked) => handlePermissionChange(record.resource, record.action, checked)}
            checkedChildren="Var"
            unCheckedChildren="Yok"
            disabled={!canUpdatePermissions}
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
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
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
            
            {hasChanges && canUpdatePermissions && (
              <>
                <Button 
                  onClick={handleCancelChanges}
                  disabled={saving}
                >
                  İptal
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleSaveAll}
                  loading={saving}
                  disabled={!hasChanges}
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </>
            )}
          </div>
        </Col>
      </Row>
      
      <Table
        columns={columns}
        scroll={{x: 1000, y: 400 }}

        dataSource={permissions}
        rowKey={(record) => `${record.resource}_${record.action}`}
        loading={loading}
        pagination={false}
      />
    </Card>
  );
};

export default PermissionsTable; 