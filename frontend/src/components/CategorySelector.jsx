import React, { useState, useRef, useEffect } from 'react';
import { Select, Divider, Input, Space, Button, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL;

const { Option } = Select;

const CategorySelect = () => {
  const [name, setName] = useState('');
  // const [category_name, setCategory_name] = useState('');
  const inputRef = useRef(null);
  const [Categories, setCategories] = useState([]);

  // categories prop'u değiştiğinde local state'i güncelle
  useEffect(() => {
  
      fetch(`${API_URL}/api/admin/categories`)
        .then((response) => response.json())
        .then((data) => setCategories(data));
    
  }, []);

  const onNameChange = (e) => {
    setName(e.target.value);
  };

  const addCategory = async () => {
    if (name && !Categories.find(cat => cat.category_name === name)) {
      const newCategory = { text: name, value: name };
      
      const response = await fetch(`${API_URL}/api/admin/categories/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({category_name:newCategory.value}),
      });

      if (!response.ok) {   
        throw new Error('Network response was not ok');
      }

      setCategories([...Categories, newCategory]); // Yerel state'i güncelle
      setName('');
      setTimeout(() => inputRef.current?.focus(), 0);
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
              />
              <Button type="text" icon={<PlusOutlined />} onClick={addCategory}>
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
