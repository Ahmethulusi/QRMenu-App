import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Typography, Tooltip, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;

const IngredientManager = ({ productId, onIngredientsChange, visible = true }) => {
  const [ingredients, setIngredients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ingredientType, setIngredientType] = useState('ekstra');

  // Ürüne ait malzemeleri yükle (eğer productId varsa)
  useEffect(() => {
    if (productId) {
      fetchIngredients();
    } else {
      setIngredients([]);
    }
  }, [productId]);

  // Malzemeler değiştiğinde üst bileşene bildir
  useEffect(() => {
    if (onIngredientsChange) {
      onIngredientsChange(ingredients);
    }
  }, [ingredients, onIngredientsChange]);
  
  // Modal tamamen kapandığında malzemeleri sıfırla (tab değişiminde değil)
  useEffect(() => {
    // visible prop'u modal'ın tamamen açık/kapalı durumunu belirtir
    // Tab değişiminde değil, modal tamamen kapandığında sıfırla
    if (!visible && visible !== undefined) {
      setIngredients([]);
    }
  }, [visible]);

  const fetchIngredients = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/ingredients/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Malzemeler yüklenirken hata oluştu');
      }

      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Malzeme yükleme hatası:', error);
      message.error('Malzemeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (ingredient = null) => {
    setEditingIngredient(ingredient);
    
    if (ingredient) {
      form.setFieldsValue({
        name: ingredient.name,
        type: ingredient.type
      });
      setIngredientType(ingredient.type);
    } else {
      form.resetFields();
      setIngredientType('ekstra');
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
      values.type = ingredientType; // Radio değerini ekle
      
      if (editingIngredient) {
        // Mevcut malzeme güncelleme
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/ingredients/${editingIngredient.ingredient_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          throw new Error('Malzeme güncellenirken hata oluştu');
        }

        const updatedIngredient = await response.json();
        setIngredients(prev => prev.map(p => 
          p.ingredient_id === editingIngredient.ingredient_id ? updatedIngredient : p
        ));
        message.success('Malzeme güncellendi');
      } else if (productId) {
        // Mevcut ürüne yeni malzeme ekleme
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/ingredients`, {
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
          throw new Error('Malzeme eklenirken hata oluştu');
        }

        const newIngredient = await response.json();
        setIngredients(prev => [...prev, newIngredient]);
        message.success('Malzeme eklendi');
      } else {
        // Yeni ürün için geçici malzeme ekleme (henüz kaydedilmemiş ürün)
        const tempIngredient = {
          ...values,
          ingredient_id: `temp-${Date.now()}`, // Geçici ID
          product_id: null,
          isNew: true // Yeni eklendiğini belirtmek için flag
        };
        setIngredients(prev => [...prev, tempIngredient]);
        message.success('Malzeme eklendi');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const handleDelete = async (ingredientId) => {
    if (!ingredientId) return;

    // Geçici malzeme ise (yeni ürün oluştururken eklenen)
    if (typeof ingredientId === 'string' && ingredientId.startsWith('temp-')) {
      setIngredients(prev => prev.filter(p => p.ingredient_id !== ingredientId));
      message.success('Malzeme kaldırıldı');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/ingredients/${ingredientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Malzeme silinirken hata oluştu');
      }

      setIngredients(prev => prev.filter(p => p.ingredient_id !== ingredientId));
      message.success('Malzeme silindi');
    } catch (error) {
      console.error('Malzeme silme hatası:', error);
      message.error('Malzeme silinemedi');
    }
  };

  const columns = [
    {
      title: 'Malzeme Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (text) => {
        if (text === 'ekstra') return <span style={{ color: '#52c41a' }}>Ekstra</span>;
        if (text === 'çıkarılacak') return <span style={{ color: '#ff4d4f' }}>Çıkarılacak</span>;
        return text;
      }
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
            onClick={() => handleDelete(record.ingredient_id)} 
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
          Ekstra ve Çıkarılacak Malzemeler
          <Tooltip title="Ürüne eklenebilecek veya çıkarılabilecek malzemeleri tanımlayın">
            <InfoCircleOutlined style={{ marginLeft: 8 }} />
          </Tooltip>
        </Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Malzeme Ekle
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={ingredients} 
        rowKey="ingredient_id"
        size="small"
        pagination={false}
        loading={loading}
        locale={{ emptyText: 'Malzeme bulunmuyor' }}
      />

      <Modal
        title={editingIngredient ? "Malzeme Düzenle" : "Yeni Malzeme Ekle"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingIngredient ? "Güncelle" : "Ekle"}
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Malzeme Adı"
            rules={[{ required: true, message: 'Lütfen malzeme adını girin!' }]}
          >
            <Input placeholder="Malzeme adını girin" />
          </Form.Item>
          
          <Form.Item
            label="Malzeme Türü"
            name="type"
            rules={[{ required: true, message: 'Lütfen malzeme türünü seçin!' }]}
          >
            <Radio.Group onChange={(e) => setIngredientType(e.target.value)} value={ingredientType}>
              <Radio.Button value="ekstra">Ekstra</Radio.Button>
              <Radio.Button value="çıkarılacak">Çıkarılacak</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IngredientManager;
