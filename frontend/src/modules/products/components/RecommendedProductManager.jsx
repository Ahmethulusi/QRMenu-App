import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Typography, Tooltip, Select, Checkbox, Row, Col, Card, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;

const RecommendedProductManager = ({ productId, onRecommendationsChange }) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Kategorileri her zaman yükle
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Ürüne ait yanında iyi gider ürünlerini yükle (eğer productId varsa)
  useEffect(() => {
    if (productId) {
      fetchRecommendedProducts();
    } else {
      setRecommendedProducts([]);
    }
  }, [productId]);

  // Yanında iyi gider ürünleri değiştiğinde üst bileşene bildir
  useEffect(() => {
    if (onRecommendationsChange) {
      onRecommendationsChange(recommendedProducts);
    }
  }, [recommendedProducts, onRecommendationsChange]);

  // Kategori seçildiğinde ürünleri getir
  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      setCategoryProducts([]);
    }
  }, [selectedCategory]);

  const fetchRecommendedProducts = async () => {
    if (!productId) return;
    
    try {
      console.log(`Ürün ID ${productId} için yanında iyi gider ürünleri yükleniyor...`);
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/recommended-products/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Yanında iyi gider ürünleri yüklenirken hata oluştu');
      }

      const data = await response.json();
      console.log(`Ürün ID ${productId} için yanında iyi gider ürünleri yüklendi:`, data);
      setRecommendedProducts(data);
    } catch (error) {
      console.error('Yanında iyi gider ürünleri yükleme hatası:', error);
      message.error('Yanında iyi gider ürünleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Kategoriler yüklenirken hata oluştu');
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Kategori yükleme hatası:', error);
      message.error('Kategoriler yüklenemedi');
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem('token');
      console.log(`Kategori ID ${categoryId} için ürünler yükleniyor...`);
      const response = await fetch(`${API_URL}/api/recommended-products/category/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Kategori ürünleri yüklenirken hata oluştu');
      }

      const data = await response.json();
      console.log(`Kategori ID ${categoryId} için ${data.length} ürün yüklendi:`, data);
      setCategoryProducts(data);
    } catch (error) {
      console.error('Kategori ürünleri yükleme hatası:', error);
      message.error('Kategori ürünleri yüklenemedi');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleProductSelect = (product, checked, additionalPrice = 0) => {
    if (checked) {
      // Ürün zaten seçili mi kontrol et
      const isAlreadySelected = recommendedProducts.some(
        rp => rp.recommended_product_id === product.product_id
      );

      if (!isAlreadySelected) {
        // Yeni ürün ekle
        const newRecommendation = {
          id: `temp-${Date.now()}`, // Geçici ID
          product_id: productId,
          recommended_product_id: product.product_id,
          additional_price: additionalPrice,
          isNew: true, // Yeni eklendiğini belirtmek için flag
          RecommendedProduct: product // Ürün bilgilerini sakla
        };
        
        setRecommendedProducts(prev => [...prev, newRecommendation]);
      }
    } else {
      // Ürünü kaldır
      setRecommendedProducts(prev => 
        prev.filter(rp => rp.recommended_product_id !== product.product_id)
      );
    }
  };

  const handleAdditionalPriceChange = (productId, price) => {
    console.log(`Ürün ID ${productId} için ek fiyat değişti: ${price}`);
    setRecommendedProducts(prev => 
      prev.map(rp => {
        if (rp.recommended_product_id === productId) {
          return { ...rp, additional_price: price };
        }
        return rp;
      })
    );
  };

  const handleSave = async () => {
    if (!productId) {
      message.info('Ürün henüz kaydedilmemiş. Yanında iyi gider ürünleri, ürün kaydedildikten sonra kaydedilecektir.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Yanında iyi gider ürünlerini hazırla
      const recommendations = recommendedProducts.map(rp => ({
        recommended_product_id: rp.recommended_product_id,
        additional_price: rp.additional_price || 0
      }));
      
      console.log('Kaydedilecek yanında iyi gider ürünleri:', recommendations);

      // Toplu güncelleme
      const response = await fetch(`${API_URL}/api/recommended-products/bulk/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recommendations })
      });

      if (!response.ok) {
        throw new Error('Yanında iyi gider ürünleri kaydedilirken hata oluştu');
      }

      const data = await response.json();
      setRecommendedProducts(data);
      message.success('Yanında iyi gider ürünleri başarıyla kaydedildi');
    } catch (error) {
      console.error('Yanında iyi gider ürünleri kaydetme hatası:', error);
      message.error('Yanında iyi gider ürünleri kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecommendation = async (recommendationId) => {
    // Geçici ID ise (yeni eklenen)
    if (typeof recommendationId === 'string' && recommendationId.startsWith('temp-')) {
      setRecommendedProducts(prev => prev.filter(rp => rp.id !== recommendationId));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/recommended-products/${recommendationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Yanında iyi gider ürün ilişkisi silinirken hata oluştu');
      }

      setRecommendedProducts(prev => prev.filter(rp => rp.id !== recommendationId));
      message.success('Yanında iyi gider ürün ilişkisi başarıyla silindi');
    } catch (error) {
      console.error('Yanında iyi gider ürün ilişkisi silme hatası:', error);
      message.error('Yanında iyi gider ürün ilişkisi silinemedi');
    }
  };

  // Seçilen ürünlerin ID'lerini içeren bir dizi oluştur
  const selectedProductIds = recommendedProducts.map(rp => rp.recommended_product_id);

  const columns = [
    {
      title: 'Ürün Adı',
      dataIndex: ['RecommendedProduct', 'product_name'],
      key: 'product_name',
      render: (text, record) => {
        return record.RecommendedProduct?.product_name || 'Ürün bilgisi yüklenemedi';
      }
    },
 
    {
      title: 'Ek Fiyat',
      dataIndex: 'additional_price',
      key: 'additional_price',
      render: (text, record) => (
        <InputNumber
          value={record.additional_price}
          onChange={(value) => handleAdditionalPriceChange(record.recommended_product_id, value)}
          formatter={value => `${value} ₺`}
          parser={value => value.replace(' ₺', '')}
          style={{ width: '100px' }}
        />
      )
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveRecommendation(record.id)} 
          type="primary" 
          danger 
          size="small"
        />
      ),
    },
  ];

  // Kategori ürünlerini filtreleme
  const filteredCategoryProducts = categoryProducts.filter(product => 
    product.product_name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          Yanında İyi Gider Ürünleri
          <Tooltip title="Bu ürünle birlikte sunulabilecek veya iyi gidecek diğer ürünler">
            <InfoCircleOutlined style={{ marginLeft: 8 }} />
          </Tooltip>
        </Title>
        <Button 
          type="primary" 
          onClick={handleSave}
          loading={loading}
        >
          Değişiklikleri Kaydet
        </Button>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Ürün Seçimi" size="small">
            <Form layout="vertical">
              <Form.Item label="Kategori Seçin">
                <Select
                  placeholder="Kategori seçin"
                  style={{ width: '100%' }}
                  onChange={handleCategoryChange}
                  value={selectedCategory}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {categories.map(category => (
                    <Option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedCategory && (
                <Form.Item label="Ürün Ara">
                  <Input
                    placeholder="Ürün ara..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                  />
                </Form.Item>
              )}
            </Form>

            <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '10px' }}>
              {loadingProducts ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Ürünler yükleniyor...</div>
              ) : (
                filteredCategoryProducts.map(product => {
                  const isSelected = selectedProductIds.includes(product.product_id);
                  const selectedProduct = recommendedProducts.find(rp => rp.recommended_product_id === product.product_id);
                  
                  return (
                    <div key={product.product_id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleProductSelect(product, e.target.checked)}
                        >
                          <span style={{ fontWeight: 'bold' }}>{product.product_name}</span>
                        </Checkbox>
                        
                        {isSelected && (
                          <InputNumber
                            value={selectedProduct?.additional_price || 0}
                            onChange={(value) => handleAdditionalPriceChange(product.product_id, value)}
                            formatter={value => `${value} ₺`}
                            parser={value => value.replace(' ₺', '')}
                            style={{ width: '100px' }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              
              {selectedCategory && filteredCategoryProducts.length === 0 && !loadingProducts && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  Bu kategoride ürün bulunamadı
                </div>
              )}
              
              {!selectedCategory && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  Lütfen bir kategori seçin
                </div>
              )}
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="Seçilen Ürünler" size="small">
            <Table 
              columns={columns} 
              dataSource={recommendedProducts} 
              rowKey="id"
              size="small"
              pagination={false}
              loading={loading}
              locale={{ emptyText: 'Yanında iyi gider ürün bulunmuyor' }}
              scroll={{ y: 400 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RecommendedProductManager;
