import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
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
  Collapse,
  InputNumber
} from 'antd';
import { 
  DatabaseOutlined, 
  LinkOutlined, 
  SearchOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import './ERPTest.css';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ERPTest = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [config, setConfig] = useState({});
  const [connectionResult, setConnectionResult] = useState(null);
  const [queryResults, setQueryResults] = useState(null);
  const [customQuery, setCustomQuery] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/erp-test/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.data);
        form.setFieldsValue(data.data);
      }
    } catch (error) {
      message.error('Konfigürasyon yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (values) => {
    try {
      setLoading(true);
      const response = await fetch('/api/erp-test/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });
      const data = await response.json();
      
      if (data.success) {
        message.success('Konfigürasyon güncellendi');
        setConfig(data.data);
        setConnectionResult(null);
        setQueryResults(null);
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error('Konfigürasyon güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTestLoading(true);
      const response = await fetch('/api/erp-test/test-connection', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      setConnectionResult(data);
      
      if (data.success) {
        message.success('Bağlantı başarılı!');
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error('Bağlantı testi sırasında hata oluştu');
    } finally {
      setTestLoading(false);
    }
  };

  const testQueries = async () => {
    try {
      setQueryLoading(true);
      const response = await fetch('/api/erp-test/test-queries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      setQueryResults(data);
      
      if (data.success) {
        message.success('Test sorguları tamamlandı');
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error('Test sorguları sırasında hata oluştu');
    } finally {
      setQueryLoading(false);
    }
  };

  const testCustomQuery = async () => {
    if (!customQuery.trim()) {
      message.warning('Lütfen sorgu metni girin');
      return;
    }

    try {
      setQueryLoading(true);
      const response = await fetch('/api/erp-test/test-custom-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ query: customQuery })
      });
      const data = await response.json();
      
      if (data.success) {
        setQueryResults(data);
        message.success('Özel sorgu başarıyla çalıştırıldı');
      } else {
        message.error(data.message);
      }
    } catch (error) {
      message.error('Özel sorgu sırasında hata oluştu');
    } finally {
      setQueryLoading(false);
    }
  };

  const renderConnectionResult = () => {
    if (!connectionResult) return null;

    return (
      <Alert
        message={connectionResult.message}
        type={connectionResult.success ? 'success' : 'error'}
        showIcon
        icon={connectionResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        style={{ marginBottom: 16 }}
      />
    );
  };

  const renderQueryResults = () => {
    if (!queryResults || !queryResults.data) return null;

    const { data } = queryResults;

    return (
      <Collapse defaultActiveKey={['databases', 'tables']} style={{ marginTop: 16 }}>
        {/* Veritabanları */}
        <Panel header="📊 Veritabanları" key="databases">
          {data.databases?.error ? (
            <Alert message={data.databases.error} type="error" showIcon />
          ) : (
            <Table
              dataSource={data.databases || []}
              columns={[
                { title: 'Veritabanı Adı', dataIndex: 'name', key: 'name' }
              ]}
              size="small"
              pagination={false}
            />
          )}
        </Panel>

        {/* Tablo Listesi */}
        <Panel header="📋 Mevcut Tablolar" key="tables">
          {data.tables?.error ? (
            <Alert message={data.tables.error} type="error" showIcon />
          ) : (
            <Table
              dataSource={data.tables || []}
              columns={[
                { title: 'Schema', dataIndex: 'schema_name', key: 'schema_name' },
                { title: 'Tablo Adı', dataIndex: 'table_name', key: 'table_name' },
                { title: 'Tip', dataIndex: 'table_type', key: 'table_type' }
              ]}
              size="small"
              pagination={false}
              scroll={{ y: 200 }}
            />
          )}
        </Panel>

        {/* STOK_GRUP Tablosu */}
        <Panel header="🏷️ STOK_GRUP Tablosu" key="stockGroupTable">
          {/* Tablo Yapısı */}
          <div style={{ marginBottom: 16 }}>
            <Text strong>📊 Tablo Yapısı:</Text>
            <Table
              dataSource={data.stockGroupStructure || []}
              columns={[
                { title: 'Kolon Adı', dataIndex: 'column_name', key: 'column_name' },
                { title: 'Veri Tipi', dataIndex: 'data_type', key: 'data_type' },
                { title: 'Null Olabilir', dataIndex: 'is_nullable', key: 'is_nullable' }
              ]}
              size="small"
              pagination={false}
              scroll={{ y: 150 }}
            />
          </div>

          {/* Örnek Veriler */}
          <div>
            <Text strong>📝 Örnek Veriler (İlk 5):</Text>
            <Table
              dataSource={data.stockGroupSample || []}
              columns={Object.keys(data.stockGroupSample?.[0] || {}).map(key => ({
                title: key,
                dataIndex: key,
                key: key,
                render: (value) => typeof value === 'string' ? value.substring(0, 50) : value
              }))}
              size="small"
              pagination={false}
              scroll={{ x: 800, y: 150 }}
            />
          </div>
        </Panel>

        {/* STOK Tablosu */}
        <Panel header="📦 STOK Tablosu" key="stockTable">
          {/* Tablo Yapısı */}
          <div style={{ marginBottom: 16 }}>
            <Text strong>📊 Tablo Yapısı:</Text>
            <Table
              dataSource={data.stockStructure || []}
              columns={[
                { title: 'Kolon Adı', dataIndex: 'column_name', key: 'column_name' },
                { title: 'Veri Tipi', dataIndex: 'data_type', key: 'data_type' },
                { title: 'Null Olabilir', dataIndex: 'is_nullable', key: 'is_nullable' }
              ]}
              size="small"
              pagination={false}
              scroll={{ y: 150 }}
            />
          </div>

          {/* Örnek Veriler */}
          <div>
            <Text strong>📝 Örnek Veriler (İlk 5):</Text>
            <Table
              dataSource={data.stockSample || []}
              columns={Object.keys(data.stockSample?.[0] || {}).map(key => ({
                title: key,
                dataIndex: key,
                key: key,
                render: (value) => typeof value === 'string' ? value.substring(0, 50) : value
              }))}
              size="small"
              pagination={false}
              scroll={{ x: 800, y: 150 }}
            />
          </div>
        </Panel>



        {/* QR Yayın İstatistikleri */}
        <Panel header="📊 QR Yayın İstatistikleri" key="qrStats">
          {data.qrPublishedStats?.error ? (
            <Alert message={data.qrPublishedStats.error} type="error" showIcon />
          ) : (
            <Table
              dataSource={data.qrPublishedStats || []}
              columns={[
                { title: 'Tablo', dataIndex: 'table_name', key: 'table_name' },
                { title: 'Toplam Kayıt', dataIndex: 'qr_published_count', key: 'qr_published_count' },
                { title: 'QR Yayınlanan', dataIndex: 'qr_enabled_count', key: 'qr_enabled_count' },
                { title: 'Yayınlanmayan', key: 'not_published',
                  render: (_, record) => record.qr_published_count - record.qr_enabled_count
                }
              ]}
              size="small"
              pagination={false}
            />
          )}
        </Panel>



        {/* Özel Sorgu Sonucu */}
        {data.recordCount !== undefined && (
          <Panel header="🔍 Özel Sorgu Sonucu" key="customQuery">
            <Alert
              message={`${data.recordCount} kayıt bulundu`}
              description={`Toplam ${data.totalRecords} kayıt, gösterilen: ${data.records?.length || 0}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            {data.records && data.records.length > 0 && (
              <Table
                dataSource={data.records}
                columns={data.columns.map(col => ({
                  title: col,
                  dataIndex: col,
                  key: col,
                  render: (value) => {
                    if (value === null || value === undefined) return <Tag color="default">NULL</Tag>;
                    if (typeof value === 'boolean') return <Tag color={value ? 'green' : 'red'}>{value ? 'True' : 'False'}</Tag>;
                    return String(value);
                  }
                }))}
                size="small"
                pagination={false}
                scroll={{ x: true }}
              />
            )}
          </Panel>
        )}
      </Collapse>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <DatabaseOutlined /> ERP Test Modülü
      </Title>
      
      <Text type="secondary">
        Local SQL Server bağlantısını test edin ve ERP entegrasyonu için gerekli sorguları çalıştırın.
      </Text>

      <Divider />

      {/* Konfigürasyon Formu */}
      <Card title="🔧 ERP Bağlantı Ayarları" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={updateConfig}
          initialValues={{ erp_port: 1433 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="SQL Server Adresi"
                name="erp_server"
                rules={[{ required: true, message: 'Server adresi gerekli!' }]}
              >
                <Input placeholder="localhost veya 192.168.1.100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Port"
                name="erp_port"
                rules={[{ required: true, message: 'Port gerekli!' }]}
              >
                <InputNumber min={1} max={65535} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Veritabanı Adı"
                name="erp_database"
                rules={[{ required: true, message: 'Veritabanı adı gerekli!' }]}
              >
                <Input placeholder="BabirDB" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Kullanıcı Adı"
                name="erp_username"
                rules={[{ required: true, message: 'Kullanıcı adı gerekli!' }]}
              >
                <Input placeholder="sa veya erp_user" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Şifre"
            name="erp_password"
            rules={[{ required: true, message: 'Şifre gerekli!' }]}
          >
            <Input.Password placeholder="SQL Server şifresi" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<DatabaseOutlined />}
              >
                Konfigürasyonu Kaydet
              </Button>
              <Button 
                onClick={loadConfig} 
                loading={loading}
                icon={<InfoCircleOutlined />}
              >
                Mevcut Ayarları Yükle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Test Butonları */}
      <Card title="🧪 Test İşlemleri" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Button
              type="primary"
              icon={<LinkOutlined />}
              loading={testLoading}
              onClick={testConnection}
              disabled={!config.erp_server}
            >
              Bağlantıyı Test Et
            </Button>
            
            <Button
              icon={<SearchOutlined />}
              loading={queryLoading}
              onClick={testQueries}
              disabled={!config.erp_server}
            >
              Otomatik Test Sorguları
            </Button>
          </Space>

          {renderConnectionResult()}
        </Space>
      </Card>

      {/* Özel Sorgu */}
      <Card title="🔍 Özel Sorgu Testi" style={{ marginBottom: 24 }}>
        <Form layout="vertical">
          <Form.Item label="SQL Sorgusu">
            <Input.TextArea
              rows={4}
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
                             placeholder="SELECT ID, AD, USTID, QR_MENU_SIRA FROM STOK_GRUP WHERE AKTIF = 1 AND QRYAYINLANIR = 1"
            />
          </Form.Item>
          
          <Form.Item>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={queryLoading}
                onClick={testCustomQuery}
                disabled={!customQuery.trim() || !config.erp_server}
              >
                Sorguyu Çalıştır
              </Button>
              
              <div style={{ marginTop: 16 }}>
                <Text strong>💡 Örnek Sorgular:</Text>
                <div style={{ marginTop: 8 }}>
                  <Button 
                    size="small" 
                    type="link" 
                    onClick={() => setCustomQuery("SELECT ID, AD, USTID, QR_MENU_SIRA FROM STOK_GRUP WHERE AKTIF = 1 AND QRYAYINLANIR = 1")}
                  >
                    QR Yayınlanan Kategoriler
                  </Button>
                  <Button 
                    size="small" 
                    type="link" 
                    onClick={() => setCustomQuery("SELECT ID, KOD, AD, STOK_GRUP, SON_ALIS_FIYAT FROM STOK WHERE AKTIF = 1 AND QRYAYINLANIR = 1")}
                  >
                    QR Yayınlanan Ürünler
                  </Button>
                  <Button 
                    size="small" 
                    type="link" 
                    onClick={() => setCustomQuery("SELECT s.ID, s.KOD, s.AD, sg.AD as GrupAdi FROM STOK s INNER JOIN STOK_GRUP sg ON s.STOK_GRUP = sg.ID WHERE s.AKTIF = 1 AND s.QRYAYINLANIR = 1")}
                  >
                    Ürünler ve Kategorileri
                  </Button>
                  <Button 
                    size="small" 
                    type="link" 
                    onClick={() => setCustomQuery("SELECT COUNT(*) as ToplamUrun, COUNT(CASE WHEN QRYAYINLANIR = 1 THEN 1 END) as QRYayinlanan FROM STOK WHERE AKTIF = 1")}
                  >
                    QR Yayın İstatistikleri
                  </Button>
                </div>
              </div>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Sonuçlar */}
      {renderQueryResults()}

      {/* Bilgi Kartı */}
      <Card title="ℹ️ Test Senaryoları" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" title="1. Bağlantı Testi">
              <Text>SQL Server'a bağlanabildiğinizi doğrulayın</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="2. Otomatik Testler">
              <Text>Veritabanı, tablo ve veri yapısını kontrol edin</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="3. Özel Sorgular">
              <Text>Kendi SQL sorgularınızı test edin</Text>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ERPTest;
