import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL;
const businessId = 1; // Frontend'den gönderilecek sabit business ID

const BranchProductMatrix = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState('');
  const [editForm] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/branches/matrix/${businessId}`);
      if (!response.ok) {
        throw new Error('Veri çekme hatası');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
      message.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    setEditingKey(record.key);
    editForm[record.key] = {
      branch_price: record.branch_price,
      available: record.available,
    };
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = editForm[key];
      const record = data.find(item => item.key === key);

      // Backend'e güncelleme isteği gönder
      const response = await fetch(`${API_URL}/api/branches/branch-products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: record.branch_id,
          product_id: record.product_id,
          price: row.branch_price,
          stock: row.available ? 1 : 0, // Basit stok mantığı
        }),
      });

      if (!response.ok) {
        throw new Error('Güncelleme başarısız');
      }

      // Frontend'de güncelle
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        newData[index] = { ...newData[index], ...row };
        setData(newData);
        setEditingKey('');
        message.success('Güncelleme başarılı!');
      }
    } catch (error) {
      message.error('Güncelleme hatası!');
    }
  };

  const handleSaveAll = async () => {
    try {
      // Tüm değişiklikleri toplu olarak kaydet
      const changes = data.filter(item => editForm[item.key]);
      
      if (changes.length === 0) {
        message.info('Kaydedilecek değişiklik yok');
        return;
      }

      // Her değişiklik için ayrı istek gönder
      const promises = changes.map(async (item) => {
        const row = editForm[item.key];
        return fetch(`${API_URL}/api/branches/branch-products`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branch_id: item.branch_id,
            product_id: item.product_id,
            price: row.branch_price,
            stock: row.available ? 1 : 0,
          }),
        });
      });

      await Promise.all(promises);
      message.success('Tüm değişiklikler kaydedildi!');
      setEditingKey('');
      editForm = {};
      fetchData(); // Verileri yenile
    } catch (error) {
      message.error('Toplu kaydetme hatası!');
    }
  };

  const columns = [
    {
      title: 'Şubeler (buralarda filtre)',
      dataIndex: 'branch_name',
      key: 'branch_name',
      filters: [...new Set(data.map(item => item.branch_name))].map(name => ({
        text: name,
        value: name,
      })),
      onFilter: (value, record) => record.branch_name.includes(value),
    },
    {
      title: 'Kategori (buralarda filtre)',
      dataIndex: 'category_name',
      key: 'category_name',
      filters: [...new Set(data.map(item => item.category_name))].map(name => ({
        text: name,
        value: name,
      })),
      onFilter: (value, record) => record.category_name.includes(value),
    },
    {
      title: 'Ürünler (buralarda filtre)',
      dataIndex: 'product_name',
      key: 'product_name',
      filters: [...new Set(data.map(item => item.product_name))].map(name => ({
        text: name,
        value: name,
      })),
      onFilter: (value, record) => record.product_name.includes(value),
    },
    {
      title: 'Liste Fiyatı',
      dataIndex: 'list_price',
      key: 'list_price',
      render: (text) => `₺${text?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Şubeye özel Fiyat',
      dataIndex: 'branch_price',
      key: 'branch_price',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <InputNumber
              value={editForm[record.key]?.branch_price}
              onChange={(value) => {
                editForm[record.key] = { ...editForm[record.key], branch_price: value };
              }}
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          );
        }
        return text ? `₺${text.toFixed(2)}` : '';
      },
    },
    {
      title: 'Şubede Bulunur mu?',
      dataIndex: 'available',
      key: 'available',
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Switch
              checked={editForm[record.key]?.available}
              onChange={(checked) => {
                editForm[record.key] = { ...editForm[record.key], available: checked };
              }}
            />
          );
        }
        return text ? '✔' : 'Yok';
      },
    },
    {
      title: 'İşlem',
      key: 'action',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              type="link"
              onClick={() => save(record.key)}
              style={{ marginRight: 8 }}
            >
              Kaydet
            </Button>
            <Button type="link" onClick={cancel}>
              İptal
            </Button>
          </span>
        ) : (
          <Button
            disabled={editingKey !== ''}
            onClick={() => edit(record)}
            type="link"
          >
            Düzenle
          </Button>
        );
      },
    },
  ];

  // Data'yı key'lerle hazırla
  const tableData = data.map((item, index) => ({
    ...item,
    key: `${item.branch_id}-${item.product_id}`,
  }));

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Şube Ürün Yönetimi</h2>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ marginRight: 8 }}
          >
            Yeni
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveAll}
            style={{ fontWeight: 'bold', fontSize: 16, padding: '8px 24px' }}
          >
            KAYDET
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default BranchProductMatrix;