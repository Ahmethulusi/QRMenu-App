import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  message, 
  Space, 
  Divider, 
  Typography, 
  Row, 
  Col,
  Alert,
  Spin,
  Table,
  Tag,
  Progress,
  Statistic
} from 'antd';
import { 
  SyncOutlined, 
  DatabaseOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import './ERPIntegration.css';

const { Title, Text } = Typography;

const ERPIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [erpStatus, setErpStatus] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [errors, setErrors] = useState([]);
  const [showErrorLog, setShowErrorLog] = useState(false);

  useEffect(() => {
    loadERPStatus();
  }, []);

  // Hata ekleme fonksiyonu
  const addError = (title, message, details = null) => {
    const newError = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('tr-TR'),
      title,
      message,
      details
    };
    setErrors(prev => [newError, ...prev]);
  };

  // Hata temizleme fonksiyonu
  const clearErrors = () => {
    setErrors([]);
  };

  const loadERPStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/erp/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('ERP Status loaded:', data.data);
          setErpStatus(data.data);
          setLastSync(data.data.last_sync_date);
        } else {
          message.error(data.message || 'ERP durumu yüklenemedi');
        }
      } else {
        const errorData = await response.json();
        const errorMsg = `HTTP ${response.status}: ERP durumu yüklenemedi`;
        message.error(errorMsg);
        addError('ERP Durumu Hatası', errorMsg, errorData);
      }
    } catch (error) {
      console.error('ERP Status Error:', error);
      const errorMsg = 'ERP durumu yüklenirken hata oluştu';
      message.error(errorMsg);
      addError('ERP Durumu Hatası', errorMsg, error.message);
    } finally {
      setLoading(false);
    }
  };

  const syncCategories = async () => {
    try {
      setSyncLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/erp/sync-categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          message.success(data.message || 'Kategoriler başarıyla senkronize edildi');
          loadERPStatus(); // Durumu yenile
        } else {
          message.error(data.message || 'Kategori senkronizasyonu başarısız');
        }
      } else {
        const errorData = await response.json();
        const errorMsg = `HTTP ${response.status}: Kategori senkronizasyonu başarısız`;
        message.error(errorMsg);
        addError('Kategori Senkronizasyon Hatası', errorMsg, errorData);
      }
    } catch (error) {
      console.error('Category Sync Error:', error);
      const errorMsg = 'Kategori senkronizasyonu sırasında hata oluştu';
      message.error(errorMsg);
      addError('Kategori Senkronizasyon Hatası', errorMsg, error.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const syncProducts = async () => {
    try {
      setSyncLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/erp/sync-products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          message.success(data.message || 'Ürünler başarıyla senkronize edildi');
          loadERPStatus(); // Durumu yenile
        } else {
          message.error(data.message || 'Ürün senkronizasyonu başarısız');
        }
      } else {
        const errorData = await response.json();
        const errorMsg = `HTTP ${response.status}: Ürün senkronizasyonu başarısız`;
        message.error(errorMsg);
        addError('Ürün Senkronizasyon Hatası', errorMsg, errorData);
      }
    } catch (error) {
      console.error('Product Sync Error:', error);
      const errorMsg = 'Ürün senkronizasyonu sırasında hata oluştu';
      message.error(errorMsg);
      addError('Ürün Senkronizasyon Hatası', errorMsg, error.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const fullSync = async () => {
    try {
      setSyncLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/erp/full-sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          message.success(data.message || 'Tam senkronizasyon başarıyla tamamlandı');
          loadERPStatus(); // Durumu yenile
        } else {
          message.error(data.message || 'Tam senkronizasyon başarısız');
        }
      } else {
        const errorData = await response.json();
        const errorMsg = `HTTP ${response.status}: Tam senkronizasyon başarısız`;
        message.error(errorMsg);
        addError('Tam Senkronizasyon Hatası', errorMsg, errorData);
      }
    } catch (error) {
      console.error('Full Sync Error:', error);
      const errorMsg = 'Tam senkronizasyon sırasında hata oluştu';
      message.error(errorMsg);
      addError('Tam Senkronizasyon Hatası', errorMsg, error.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const updateStockLevels = async () => {
    try {
      setSyncLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/erp/update-stock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          message.success(data.message || 'Stok bilgileri başarıyla güncellendi');
        } else {
          message.error(data.message || 'Stok güncelleme başarısız');
        }
      } else {
        const errorData = await response.json();
        const errorMsg = `HTTP ${response.status}: Stok güncelleme başarısız`;
        message.error(errorMsg);
        addError('Stok Güncelleme Hatası', errorMsg, errorData);
      }
    } catch (error) {
      console.error('Stock Update Error:', error);
      const errorMsg = 'Stok güncelleme sırasında hata oluştu';
      message.error(errorMsg);
      addError('Stok Güncelleme Hatası', errorMsg, error.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const renderERPStatus = () => {
    if (!erpStatus) return null;

    return (
      <Card title="📊 ERP Durumu" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="ERP Durumu"
              value={erpStatus.erp_enabled ? 'Aktif' : 'Pasif'}
              valueStyle={{ color: erpStatus.erp_enabled ? '#3f8600' : '#cf1322' }}
              prefix={erpStatus.erp_enabled ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Sunucu"
              value={erpStatus.erp_server || 'N/A'}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Veritabanı"
              value={erpStatus.erp_database || 'N/A'}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Son Senkronizasyon"
              value={lastSync ? new Date(lastSync).toLocaleDateString('tr-TR') : 'Hiç yapılmadı'}
            />
          </Col>
        </Row>
        
        {!erpStatus.has_config && (
          <Alert
            message="ERP Konfigürasyonu Eksik"
            description="ERP Test modülünden bağlantı ayarlarını yapılandırın."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
        
        {/* Debug bilgisi */}
        <Alert
          message="Debug Bilgisi"
          description={
            <div>
              <p><strong>erp_enabled:</strong> {erpStatus.erp_enabled ? 'true' : 'false'}</p>
              <p><strong>erp_server:</strong> {erpStatus.erp_server || 'null'}</p>
              <p><strong>erp_database:</strong> {erpStatus.erp_database || 'null'}</p>
              <p><strong>has_config:</strong> {erpStatus.has_config ? 'true' : 'false'}</p>
              <p><strong>Butonlar Enabled:</strong> {erpStatus.erp_server && erpStatus.erp_database ? 'true' : 'false'}</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SyncOutlined /> ERP Entegrasyon
      </Title>
      
      <Text type="secondary">
        ERP sisteminden kategorileri ve ürünleri senkronize edin.
      </Text>

      <Divider />

      {/* ERP Durumu */}
      {renderERPStatus()}

      {/* Senkronizasyon İşlemleri */}
      <Card title="🔄 Senkronizasyon İşlemleri" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="🏷️ Kategori Senkronizasyonu">
              <Text>ERP'den stok gruplarını (kategorileri) senkronize eder.</Text>
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  loading={syncLoading}
                  onClick={syncCategories}
                  disabled={!erpStatus?.erp_server || !erpStatus?.erp_database}
                  block
                >
                  Kategorileri Senkronize Et
                </Button>
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card size="small" title="📦 Ürün Senkronizasyonu">
              <Text>ERP'den stok bilgilerini (ürünleri) senkronize eder.</Text>
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  loading={syncLoading}
                  onClick={syncProducts}
                  disabled={!erpStatus?.erp_server || !erpStatus?.erp_database}
                  block
                >
                  Ürünleri Senkronize Et
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="🚀 Tam Senkronizasyon">
              <Text>Önce kategorileri, sonra ürünleri senkronize eder.</Text>
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  loading={syncLoading}
                  onClick={fullSync}
                  disabled={!erpStatus?.erp_database}
                  block
                >
                  Tam Senkronizasyon
                </Button>
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card size="small" title="💰 Fiyat Güncelleme">
              <Text>ERP'den güncel fiyat bilgilerini alır.</Text>
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  loading={syncLoading}
                  onClick={updateStockLevels}
                  disabled={!erpStatus?.erp_server || !erpStatus?.erp_database}
                  block
                >
                  Fiyatları Güncelle
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Bilgi Kartı */}
      <Card title="ℹ️ Entegrasyon Bilgileri">
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" title="1. Konfigürasyon">
              <Text>ERP Test modülünden bağlantı ayarlarını yapın</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="2. Test">
              <Text>Bağlantıyı ve sorguları test edin</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="3. Senkronizasyon">
              <Text>Kategorileri ve ürünleri senkronize edin</Text>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Hata Log Kartı */}
      <Card 
        title={
          <Space>
            <span>🚨 Hata Logları</span>
            {errors.length > 0 && (
              <Tag color="red" style={{ marginLeft: 8 }}>
                {errors.length} hata
              </Tag>
            )}
          </Space>
        }
        extra={
          <Space>
            <Button 
              size="small" 
              onClick={() => setShowErrorLog(!showErrorLog)}
              icon={showErrorLog ? <CloseCircleOutlined /> : <InfoCircleOutlined />}
            >
              {showErrorLog ? 'Gizle' : 'Göster'}
            </Button>
            {errors.length > 0 && (
              <Button 
                size="small" 
                danger 
                onClick={clearErrors}
                icon={<ReloadOutlined />}
              >
                Temizle
              </Button>
            )}
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        {showErrorLog && (
          <div>
            {errors.length === 0 ? (
              <Alert
                message="Hata Yok"
                description="Henüz hiç hata oluşmadı."
                type="success"
                showIcon
              />
            ) : (
              <div>
                {errors.map((error) => (
                  <Alert
                    key={error.id}
                    message={
                      <div>
                        <strong>{error.title}</strong>
                        <span style={{ marginLeft: 8, fontSize: '12px', color: '#666' }}>
                          {error.timestamp}
                        </span>
                      </div>
                    }
                    description={
                      <div>
                        <p>{error.message}</p>
                        {error.details && (
                          <details style={{ marginTop: 8 }}>
                            <summary style={{ cursor: 'pointer', color: '#1890ff' }}>
                              Detayları Göster
                            </summary>
                            <pre style={{ 
                              background: '#f5f5f5', 
                              padding: '8px', 
                              borderRadius: '4px',
                              fontSize: '12px',
                              overflow: 'auto',
                              maxHeight: '200px'
                            }}>
                              {JSON.stringify(error.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    }
                    type="error"
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Loading Overlay */}
      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default ERPIntegration;
