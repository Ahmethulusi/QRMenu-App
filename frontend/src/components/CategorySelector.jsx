import React, { useState, useRef, useEffect } from 'react';
import { Select, Divider, Input, Space, Button, Form, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL;

const { Option } = Select;

const CategorySelect = () => {
  const [name, setName] = useState('');
  const inputRef = useRef(null);
  const [Categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Kategorileri yükle
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  // categories prop'u değiştiğinde local state'i güncelle
  useEffect(() => {
    fetchCategories();
  }, []);

  const onNameChange = (e) => {
    setName(e.target.value);
  };

  const addCategory = async () => {
    if (!name.trim()) {
      message.error('Kategori adı boş olamaz!');
      return;
    }

    if (Categories.find(cat => cat.category_name === name.trim())) {
      message.error('Bu kategori zaten mevcut!');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/admin/categories/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category_name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error('Kategori oluşturulamadı');
      }

      const newCategory = await response.json();
      
      // Yeni kategoriyi listeye ekle
      setCategories(prevCategories => [...prevCategories, newCategory]);
      
      // Form'da yeni kategoriyi seç
      const form = document.querySelector('form');
      if (form) {
        const categoryField = form.querySelector('input[name="category"]');
        if (categoryField) {
          categoryField.value = newCategory.category_id;
        }
      }
      
      message.success('Kategori başarıyla oluşturuldu!');
      setName('');
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      console.error('Kategori oluşturma hatası:', error);
      message.error('Kategori oluşturulamadı!');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    }
  };

  return (
    <Form.Item
      label="Kategori"
      name="category"
      rules={[{ required: true, message: 'Lütfen kategori seçiniz!' }]}
    >
      <Select
        placeholder="Kategori seçin"
        dropdownRender={menu => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }}>
              <Input
                placeholder="Yeni kategori ekleyin"
                ref={inputRef}
                value={name}
                onChange={onNameChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <Button 
                type="text" 
                icon={<PlusOutlined />} 
                onClick={addCategory}
                loading={loading}
                disabled={!name.trim()}
              >
                Ekle
              </Button>
            </Space>
          </>
        )}
      >
        {Categories.map((category) => (
          <Option key={category.category_id} value={category.category_id}>
            {category.category_name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default CategorySelect;
