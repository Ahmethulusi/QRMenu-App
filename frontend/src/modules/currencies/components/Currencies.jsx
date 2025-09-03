import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  Switch, 
  message, 
  Space, 
  Popconfirm,
  Card,
  Tag,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  ReloadOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DollarCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import '../css/Currencies.css';
import '../../tables_and_QR/css/tableSizeManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const { Option } = Select;

const Currencies = () => {
  const [currencies, setCurrencies] = useState([]);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [form] = Form.useForm();

  // Para birimlerini yükle
  const loadCurrencies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/currencies`);
      if (response.ok) {
        const data = await response.json();
        setCurrencies(data);
      } else {
        message.error('Para birimleri yüklenemedi');
      }
    } catch (error) {
      console.error('Para birimleri yükleme hatası:', error);
      message.error('Para birimleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Mevcut para birimlerini yükle
  const loadAvailableCurrencies = async () => {
    try {
      const response = await fetch(`${API_URL}/api/currencies/available`);
      if (response.ok) {
        const data = await response.json();
        setAvailableCurrencies(data);
      }
    } catch (error) {
      console.error('Mevcut para birimleri yükleme hatası:', error);
    }
  };

  // Döviz kurlarını güncelle
  const updateExchangeRates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/currencies/update-rates`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        message.success(data.message);
        loadCurrencies(); // Listeyi yenile
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Döviz kurları güncellenemedi');
      }
    } catch (error) {
      console.error('Döviz kurları güncelleme hatası:', error);
      message.error('Döviz kurları güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Yeni para birimi ekle
  const handleAddCurrency = async (values) => {
    try {
      const response = await fetch(`${API_URL}/api/currencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: values.code }),
      });

      if (response.ok) {
        message.success('Para birimi başarıyla eklendi');
        setModalVisible(false);
        form.resetFields();
        loadCurrencies();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Para birimi eklenemedi');
      }
    } catch (error) {
      console.error('Para birimi ekleme hatası:', error);
      message.error('Para birimi eklenirken hata oluştu');
    }
  };

  // Para birimi güncelle
  const handleUpdateCurrency = async (values) => {
    try {
      const response = await fetch(`${API_URL}/api/currencies/${editingCurrency.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Para birimi başarıyla güncellendi');
        setModalVisible(false);
        setEditingCurrency(null);
        form.resetFields();
        loadCurrencies();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Para birimi güncellenemedi');
      }
    } catch (error) {
      console.error('Para birimi güncelleme hatası:', error);
      message.error('Para birimi güncellenirken hata oluştu');
    }
  };

  // Para birimi sil
  const handleDeleteCurrency = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/currencies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Para birimi başarıyla silindi');
        loadCurrencies();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'Para birimi silinemedi');
      }
    } catch (error) {
      console.error('Para birimi silme hatası:', error);
      message.error('Para birimi silinirken hata oluştu');
    }
  };

  // Modal açma
  const showModal = (currency = null) => {
    setEditingCurrency(currency);
    setModalVisible(true);
    
    if (currency) {
      form.setFieldsValue({
        rate_to_usd: currency.rate_to_usd,
        is_active: currency.is_active
      });
    } else {
      form.resetFields();
    }
  };

  // Modal kapatma
  const handleCancel = () => {
    setModalVisible(false);
    setEditingCurrency(null);
    form.resetFields();
  };

  // Form submit
  const handleSubmit = (values) => {
    if (editingCurrency) {
      handleUpdateCurrency(values);
    } else {
      handleAddCurrency(values);
    }
  };

  useEffect(() => {
    loadCurrencies();
    loadAvailableCurrencies();
  }, []);

  // Tablo sütunları
  const columns = [
    {
      title: 'Para Birimi',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <span style={{ fontSize: '18px' }}>{record.symbol}</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{record.code}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'USD Kuru',
      dataIndex: 'rate_to_usd',
      key: 'rate_to_usd',
      render: (value) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {parseFloat(value).toFixed(6)}
        </span>
      ),
      sorter: (a, b) => a.rate_to_usd - b.rate_to_usd,
    },
    {
      title: 'Durum',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Son Güncelleme',
      dataIndex: 'last_updated',
      key: 'last_updated',
      render: (date) => date ? new Date(date).toLocaleString('tr-TR') : '-',
      sorter: (a, b) => new Date(a.last_updated) - new Date(b.last_updated),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bu para birimini silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDeleteCurrency(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Tooltip title="Sil">
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];



  return (
    <div className="currencies-container">
      <div className="currencies-header">
        <h2>
          <DollarCircleOutlined /> Para Birimleri Yönetimi
        </h2>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Yeni Para Birimi Ekle
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadCurrencies}
            loading={loading}
          >
            Yenile
          </Button>
          <Button
            type="default"
            icon={<SyncOutlined />}
            onClick={updateExchangeRates}
            loading={loading}
          >
            Kurları Güncelle
          </Button>
        </Space>
      </div>



      {/* Para birimleri tablosu */}
      <Card>
        <Table
          // className='ant-table-body'
          columns={columns}
          dataSource={currencies}
          rowKey="id"
          loading={loading}
          // pagination={{
          //   pageSize: 5,
          //   showSizeChanger: true,
          //   showQuickJumper: true,
          //   pageSizeOptions: ['5', '10', '20', '50'],
          //   showTotal: (total, range) => 
          //     `${range[0]}-${range[1]} / ${total} para birimi`,
          // }}
          pagination={false}
          scroll={{y: 200 }}
        />
      </Card>

      {/* Para birimi ekleme/düzenleme modalı */}
      <Modal
        title={editingCurrency ? 'Para Birimi Düzenle' : 'Yeni Para Birimi Ekle'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {!editingCurrency && (
            <>
              <Form.Item
                name="code"
                label="Para Birimi Kodu"
                rules={[
                  { required: true, message: 'Para birimi kodu gerekli' },
                  { min: 3, max: 3, message: 'Para birimi kodu 3 karakter olmalı' }
                ]}
              >
                <Select
                  placeholder="Para birimi seçin"
                  showSearch
                >
                  {availableCurrencies.map(currency => (
                    <Option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <div style={{ 
                background: '#e6f7ff', 
                border: '1px solid #91d5ff', 
                borderRadius: '6px', 
                padding: '12px', 
                marginBottom: '16px',
                fontSize: '14px',
                color: '#1890ff'
              }}>
                💡 <strong>Bilgi:</strong> Seçilen para biriminin güncel USD kuru otomatik olarak API'den çekilecektir.
              </div>
            </>
          )}



          <Form.Item
            name="is_active"
            label="Durum"
            valuePropName="checked"
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCurrency ? 'Güncelle' : 'Ekle'}
              </Button>
              <Button onClick={handleCancel}>
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Currencies;
