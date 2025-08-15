import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Button, message, Spin } from 'antd';
import { PercentageOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL;

const { Option } = Select;

const BulkPriceChange = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [applyingChanges, setApplyingChanges] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Kategorileri API'den çekme
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/categories`);
      if (!response.ok) {
        throw new Error('Kategoriler alınamadı!');
      }
      const categoriesData = await response.json();
      const formattedCategories = categoriesData.map((category) => ({
        label: category.category_name,
        value: category.category_id,
      }));
      setCategories(formattedCategories);
    } catch (error) {
      console.error('Fetch Hatası:', error);
      message.error('Kategoriler alınırken bir hata oluştu!');
    } finally {
      setLoadingCategories(false);
    }
  };

  // // Fiyat değişikliklerini uygulama
  const handleUpdatePrices  = async (values) => {
    const { categoryId, percentage } = values;
    setApplyingChanges(true);
    try {
        const response = await fetch(`${API_URL}/api/admin/products/bulk-update-prices`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categoryIds: categoryId, // Dizi olduğu için plural yapalım
                percentage: percentage
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Backend hatası:', errorData);
            message.error('Değişiklikler uygulanamadı. Lütfen daha sonra tekrar deneyin.');
        } else {
            message.success('Değişiklikler başarıyla uygulandı!');
        }
    } catch (error) {
        console.error('Hata:', error);
        message.error('Beklenmedik bir hata oluştu.');
    } finally {
        setApplyingChanges(false);
        form.resetFields();
    }
};
  

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={handleUpdatePrices}
      style={{ marginBottom: '20px' }}
    >
      <Form.Item style={{marginRight:'40px', marginLeft:'40px', blockSize:'40px'}}>
        Toplu Fiyat Değişikliği
      </Form.Item>

      <Form.Item
        name="categoryId"        
        rules={[{ required: true, message: 'Lütfen bir kategori seçin!' }]}
      >
        <Select
          
          placeholder="Kategori Seçin"
          style={{ width: 300 }}
          loading={loadingCategories}
          mode="multiple" // Çoklu seçim için mode ekledik
        >
          {categories.map((category) => (
            <Option key={category.value} value={category.value}>
              {category.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="percentage"
        rules={[
          { required: true, message: 'Lütfen yüzde oranını girin!' },
          {
            type: 'number',
            min: -100,
            max: 100,
            message: 'Yüzde oranı -100 ile 100 arasında olmalıdır!',
          },
        ]}
      >
        <InputNumber
          prefix={<PercentageOutlined />}
          suffix="%"
          placeholder="Yüzde (%)"
          style={{ width: 150 }}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={applyingChanges}
        >
          Uygula
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BulkPriceChange;
