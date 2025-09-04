import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Typography, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
const API_URL = import.meta.env.VITE_API_URL;

const PortionManager = ({ productId, onPortionsChange }) => {
  const [portions, setPortions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPortion, setEditingPortion] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Ürüne ait porsiyonları yükle (eğer productId varsa)
  useEffect(() => {
    if (productId) {
      fetchPortions();
    } else {
      setPortions([]);
    }
  }, [productId]);

  // Porsiyonlar değiştiğinde üst bileşene bildir
  useEffect(() => {
    if (onPortionsChange) {
      onPortionsChange(portions);
    }
  }, [portions, onPortionsChange]);

  const fetchPortions = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/portions/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Porsiyonlar yüklenirken hata oluştu');
      }

      const data = await response.json();
      setPortions(data);
    } catch (error) {
      console.error('Porsiyon yükleme hatası:', error);
      message.error('Porsiyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (portion = null) => {
    setEditingPortion(portion);
    
    if (portion) {
      form.setFieldsValue({
        name: portion.name,
        quantity: portion.quantity,
        price: portion.price
      });
    } else {
      form.resetFields();
    }
    
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingPortion) {
        // Mevcut porsiyon güncelleme
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/portions/${editingPortion.portion_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          throw new Error('Porsiyon güncellenirken hata oluştu');
        }

        const updatedPortion = await response.json();
        setPortions(prev => prev.map(p => 
          p.portion_id === editingPortion.portion_id ? updatedPortion : p
        ));
        message.success('Porsiyon güncellendi');
      } else if (productId) {
        // Mevcut ürüne yeni porsiyon ekleme
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/portions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...values,
            product_id: productId
          })
        });

        if (!response.ok) {
          throw new Error('Porsiyon eklenirken hata oluştu');
        }

        const newPortion = await response.json();
        setPortions(prev => [...prev, newPortion]);
        message.success('Porsiyon eklendi');
      } else {
        // Yeni ürün için geçici porsiyon ekleme (henüz kaydedilmemiş ürün)
        const tempPortion = {
          ...values,
          portion_id: `temp-${Date.now()}`, // Geçici ID
          isNew: true // Yeni eklendiğini belirtmek için flag
        };
        setPortions(prev => [...prev, tempPortion]);
        message.success('Porsiyon eklendi');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const handleDelete = async (portionId) => {
    if (!portionId) return;

    // Geçici porsiyon ise (yeni ürün oluştururken eklenen)
    if (typeof portionId === 'string' && portionId.startsWith('temp-')) {
      setPortions(prev => prev.filter(p => p.portion_id !== portionId));
      message.success('Porsiyon kaldırıldı');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/portions/${portionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Porsiyon silinirken hata oluştu');
      }

      setPortions(prev => prev.filter(p => p.portion_id !== portionId));
      message.success('Porsiyon silindi');
    } catch (error) {
      console.error('Porsiyon silme hatası:', error);
      message.error('Porsiyon silinemedi');
    }
  };

  const columns = [
    {
      title: 'Porsiyon Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => text || '-'
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      render: (text) => text ? `${text} ₺` : '-'
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)} 
            type="primary" 
            size="small"
          />
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.portion_id)} 
            type="primary" 
            danger 
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          Porsiyonlar
          <Tooltip title="Ürün için farklı porsiyon seçenekleri ekleyebilirsiniz (ör: küçük, orta, büyük)">
            <InfoCircleOutlined style={{ marginLeft: 8 }} />
          </Tooltip>
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Porsiyon Ekle
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={portions} 
        rowKey="portion_id"
        size="small"
        pagination={false}
        loading={loading}
        locale={{ emptyText: 'Porsiyon bulunmuyor' }}
      />

      <Modal
        title={editingPortion ? "Porsiyon Düzenle" : "Yeni Porsiyon Ekle"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingPortion ? "Güncelle" : "Ekle"}
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Porsiyon Adı"
            rules={[{ required: true, message: 'Lütfen porsiyon adını girin!' }]}
          >
            <Input placeholder="Örn: Küçük, Orta, Büyük" />
          </Form.Item>
          
          <Form.Item
            name="quantity"
            label="Miktar (Opsiyonel)"
          >
            <Input placeholder="Örn: 100 ml, 250 gr" />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="Fiyat (Opsiyonel)"
          >
            <InputNumber 
              placeholder="Fiyat" 
              style={{ width: '100%' }} 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PortionManager;
