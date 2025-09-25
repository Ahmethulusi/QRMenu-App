import React, { useState, useEffect } from 'react';
import { Table, Switch, Card, Row, Col, Typography, message, Select, Button } from 'antd';
import { getRolePermissionsAPI, updateRolePermissionsAPI } from '../../common/utils/api';
import { usePermissions } from '../../common/hooks/usePermissions';
import { getCurrentUser } from '../../common/utils/permissions';

const { Title } = Typography;
const { Option } = Select;

const PermissionsTable = ({ businessId }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('manager'); // Default value
  const [rolePermissions, setRolePermissions] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [tableKey, setTableKey] = useState(0);
  
  // İzin kontrolü
  const { hasPermission } = usePermissions();
  
  // Mevcut kullanıcı bilgisi
  const currentUser = getCurrentUser();
  
  // Kullanıcının rolüne göre default seçili rol
  const getDefaultRole = () => {
    if (currentUser?.role === 'admin') {
      return 'manager'; // Admin sadece Manager'ı düzenleyebilir
    } else if (currentUser?.role === 'super_admin') {
      return 'manager'; // Super Admin için default Manager
    }
    return 'manager'; // Fallback
  };

  const resources = [
    { key: 'products', label: 'Ürünler' },
    { key: 'categories', label: 'Kategoriler' },
    { key: 'users', label: 'Kullanıcılar' },
    { key: 'branches', label: 'Şubeler' },
    { key: 'qrcodes', label: 'QR Kodlar' },
    { key: 'tables', label: 'Masalar' },
    { key: 'businesses', label: 'İşletmeler' },
    { key: 'labels', label: 'Etiketler' },
    { key: 'announcements', label: 'Duyurular' },
    { key: 'erp', label: 'ERP Entegrasyonu' },
    { key: 'currencies', label: 'Para Birimleri' },
    { key: 'business_profile', label: 'İşletme Profili' },
    { key: 'languages', label: 'Diller' },
    { key: 'permissions', label: 'Yetkiler' }
  ];

  const actions = [
    { key: 'read', label: 'Görüntüleme', description: 'Liste görüntüleme ve detay inceleme' },
    { key: 'create', label: 'Oluşturma', description: 'Yeni kayıt ekleme' },
    { key: 'update', label: 'Güncelleme', description: 'Mevcut kayıtları düzenleme' },
    { key: 'delete', label: 'Silme', description: 'Kayıtları kalıcı olarak silme' },
    { key: 'sort', label: 'Sıralama', description: 'Kayıtların sırasını değiştirme' },
    { key: 'image_upload', label: 'Resim Yükleme', description: 'Dosya yükleme işlemleri' },
    { key: 'bulk_update', label: 'Toplu Güncelleme', description: 'Birden fazla kaydı aynı anda güncelleme' },
    { key: 'settings', label: 'Ayarlar', description: 'Sistem ayarlarını yönetme' }
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

  // Component mount olduğunda ve kullanıcı değiştiğinde default rolü güncelle
  useEffect(() => {
    setSelectedRole(getDefaultRole());
  }, [currentUser]);
  
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
  
  // Tablo filtreleme değişikliği
  const handleTableChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
  };
  
  // Filtreleri temizle
  const clearFilters = () => {
    setFilteredInfo({});
    // Table component'ini yeniden mount ederek filtreleri temizle
    setTableKey(prev => prev + 1);
  };

  // Tablo kolonları
  const columns = [
    {
      title: 'Kaynak',
      dataIndex: 'resource',
      key: 'resource',
      filters: resources.map(resource => ({
        text: resource.label,
        value: resource.key
      })),
      onFilter: (value, record) => record.resource === value,
      render: (resource) => {
        const resourceObj = resources.find(r => r.key === resource);
        return resourceObj ? resourceObj.label : resource;
      }
    },
    {
      title: 'İşlem',
      dataIndex: 'action',
      key: 'action',
      filters: actions.map(action => ({
        text: action.label,
        value: action.key
      })),
      onFilter: (value, record) => record.action === value,
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
              {/* Admin sadece Manager rolünü düzenleyebilir */}
              {currentUser?.role === 'admin' && (
                <Option value="manager">Manager</Option>
              )}
              
              {/* Super Admin tüm rolleri düzenleyebilir */}
              {currentUser?.role === 'super_admin' && (
                <>
                  <Option value="manager">Manager</Option>
                  <Option value="admin">Admin</Option>
                  <Option value="super_admin">Super Admin</Option>
                </>
              )}
            </Select>
            
            {/* Filtreleri temizle butonu */}
            {Object.keys(filteredInfo).length > 0 && (
              <Button 
                onClick={clearFilters}
                size="small"
              >
                Filtreleri Temizle
              </Button>
            )}
            
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
        key={tableKey}
        columns={columns}
        scroll={{x: 1000, y: 400 }}
        dataSource={permissions}
        rowKey={(record) => `${record.resource}_${record.action}`}
        loading={loading}
        pagination={false}
        onChange={handleTableChange}
        filteredInfo={filteredInfo}
      />
    </Card>
  );
};

export default PermissionsTable; 