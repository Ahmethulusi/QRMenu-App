import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Switch, message, Row, Col, Card, List, Typography, Select, Modal, Form, Input } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
// import '../css/BranchProductMatrix.css';

const { Title, Text } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;
const businessId = 1; // Frontend'den gönderilecek sabit business ID

const BranchProductMatrix = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [editForm, setEditForm] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form] = Form.useForm();

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
      setBranches(result.branches);
      
      // Tüm kategorileri topla
      const categories = new Set();
      result.allProducts.forEach(product => {
        categories.add(product.category_name);
      });
      
      setAllCategories(Array.from(categories));
      setAllProducts(result.allProducts);
      setFilteredProducts(result.allProducts);
      console.log('Backend response:', result);
      console.log('Branches:', result.branches);
      console.log('Sample branch product:', result.branches[0]?.categories[0]?.products[0]);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
      message.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme fonksiyonları
  const handleBranchFilter = (branchId) => {
    setSelectedBranch(branchId);
    if (branchId) {
      // Şube seçildiğinde tüm ürünleri göster, ama şube bilgilerini ekle
      const selectedBranchData = branches.find(b => b.branch_id === branchId);
      const productsWithBranchData = allProducts.map(product => {
        const branchProduct = selectedBranchData.categories
          .flatMap(cat => cat.products)
          .find(bp => bp.product_id === product.product_id);
        
        return {
          ...product,
          branch_price: branchProduct ? branchProduct.branch_price : null,
          available: branchProduct ? branchProduct.available : false, // Bu zaten doğru
          branch_id: branchId,
        };
      });
      setFilteredProducts(productsWithBranchData);
    } else {
      setFilteredProducts(allProducts);
    }
  };

  const handleCategoryFilter = (categoryName) => {
    setSelectedCategory(categoryName);
    if (categoryName) {
      const filtered = allProducts.filter(product => 
        product.category_name === categoryName
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(allProducts);
    }
  };

  const clearFilters = () => {
    setSelectedBranch(null);
    setSelectedCategory(null);
    setFilteredProducts(allProducts);
  };

  // Şube oluşturma fonksiyonları
  const openModal = (branch = null) => {
    setEditingBranch(branch);
    if (branch) {
      form.setFieldsValue(branch);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields(); 
      const branchId = editingBranch ? editingBranch.id : null;
      const url = editingBranch
        ? `${API_URL}/api/branches/${branchId}`
        : `${API_URL}/api/branches/`;
      const method = editingBranch ? 'PUT' : 'POST';
      const body = JSON.stringify({ ...values, businessId: businessId });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Kaydetme işlemi başarısız');
      }

      message.success(editingBranch ? 'Şube güncellendi' : 'Şube eklendi');
      setModalVisible(false);
      fetchData(); // Verileri yenile
    } catch (error) {
      message.error(error.message || 'Kaydetme işlemi başarısız');
    }
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    if (!selectedBranch) {
      message.warning('Lütfen önce bir şube seçin');
      return;
    }
    
    setEditingKey(record.key);
    setEditForm({
      ...editForm,
      [record.key]: {
        branch_price: record.branch_price,
        available: record.available,
      },
    });
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = editForm[key];
      const productId = parseInt(key);
      
      const requestBody = {
        branch_id: selectedBranch,
        product_id: productId,
        price: row.branch_price,
        stock: row.available ? 1 : 0,
      };
      
      console.log('Gönderilen veri:', requestBody);

      // Backend'e güncelleme isteği gönder
      const response = await fetch(`${API_URL}/api/branches/branch-products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend hatası:', errorData);
        throw new Error(errorData.error || 'Güncelleme başarısız');
      }

      const result = await response.json();
      console.log('Başarılı response:', result);

      // State'leri güncelle - API çağrısı yapmadan
      setFilteredProducts(prevProducts => 
        prevProducts.map(product => {
          if (product.product_id === productId) {
            return {
              ...product,
              branch_price: row.branch_price,
              available: row.available,
            };
          }
          return product;
        })
      );

      // Branches state'ini de güncelle
      setBranches(prevBranches => 
        prevBranches.map(branch => {
          if (branch.branch_id === selectedBranch) {
            return {
              ...branch,
              categories: branch.categories.map(category => ({
                ...category,
                products: category.products.map(product => {
                  if (product.product_id === productId) {
                    return {
                      ...product,
                      branch_price: row.branch_price,
                      available: row.available,
                    };
                  }
                  return product;
                })
              }))
            };
          }
          return branch;
        })
      );

      message.success('Güncelleme başarılı!');
      setEditingKey('');
    } catch (error) {
      console.error('Frontend hatası:', error);
      message.error('Güncelleme hatası!');
    }
  };

  const handleSaveAll = async () => {
    try {
      if (!selectedBranch) {
        message.warning('Lütfen önce bir şube seçin');
        return;
      }

      const changes = Object.keys(editForm);
      
      if (changes.length === 0) {
        message.info('Kaydedilecek değişiklik yok');
        return;
      }

      const promises = changes.map(async (key) => {
        const row = editForm[key];
        const productId = parseInt(key);
        return fetch(`${API_URL}/api/branches/branch-products`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branch_id: selectedBranch,
            product_id: productId,
            price: row.branch_price,
            stock: row.available ? 1 : 0,
          }),
        });
      });

      await Promise.all(promises);
      
      // State'leri güncelle - API çağrısı yapmadan
      setFilteredProducts(prevProducts => 
        prevProducts.map(product => {
          const change = editForm[product.product_id];
          if (change) {
            return {
              ...product,
              branch_price: change.branch_price,
              available: change.available,
            };
          }
          return product;
        })
      );

      // Branches state'ini de güncelle
      setBranches(prevBranches => 
        prevBranches.map(branch => {
          if (branch.branch_id === selectedBranch) {
            return {
              ...branch,
              categories: branch.categories.map(category => ({
                ...category,
                products: category.products.map(product => {
                  const change = editForm[product.product_id];
                  if (change) {
                    return {
                      ...product,
                      branch_price: change.branch_price,
                      available: change.available,
                    };
                  }
                  return product;
                })
              }))
            };
          }
          return branch;
        })
      );

      message.success('Tüm değişiklikler kaydedildi!');
      setEditingKey('');
      setEditForm({});
    } catch (error) {
      message.error('Toplu kaydetme hatası!');
    }
  };

           const renderProductTable = () => {
      const columns = [
        {
          title: 'Kategori',
          dataIndex: 'category_name',
          key: 'category_name',
          width: '20%',
          filters: allCategories.map(category => ({ text: category, value: category })),
          onFilter: (value, record) => record.category_name === value,
        },
        {
          title: 'Ürün Adı',
          dataIndex: 'product_name',
          key: 'product_name',
          width: '30%',
        },
        {
          title: 'Liste Fiyatı',
          dataIndex: 'list_price',
          key: 'list_price',
          width: '15%',
          render: (text) => `₺${text?.toFixed(2) || '0.00'}`,
        },
        {
          title: 'Şubeye Özel Fiyat',
          dataIndex: 'branch_price',
          key: 'branch_price',
          width: '18%',
          render: (text, record) => {
            const key = `${record.product_id}`;
            if (isEditing(record)) {
              return (
                <InputNumber
                  value={editForm[key]?.branch_price}
                  onChange={(value) => {
                    setEditForm({
                      ...editForm,
                      [key]: { ...editForm[key], branch_price: value },
                    });
                  }}
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                />
              );
            }
            return selectedBranch ? (text ? `₺${text.toFixed(2)}` : '-') : '-';
          },
        },
        {
          title: 'Şubede Bulunur mu?',
          dataIndex: 'available',
          key: 'available',
          width: '15%',
          render: (text, record) => {
            const key = `${record.product_id}`;
            if (isEditing(record)) {
              return (
                <Switch
                  checked={editForm[key]?.available}
                  onChange={(checked) => {
                    setEditForm({
                      ...editForm,
                      [key]: { ...editForm[key], available: checked },
                    });
                  }}
                />
              );
            }
            return selectedBranch ? (text ? '✔' : '✗') : '-';
          },
        },
        {
          title: 'İşlem',
          key: 'action',
          width: '12%',
          render: (_, record) => {
            const key = `${record.product_id}`;
            const editable = isEditing(record);
            return editable ? (
              <span>
                <Button
                  type="link"
                  onClick={() => save(key)}
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
                disabled={editingKey !== '' || !selectedBranch}
                onClick={() => edit(record)}
                type="link"
              >
                Düzenle
              </Button>
            );
          },
        },
      ];

                   return (
            <div style={{ 
              height: '350px', 
              border: '1px solid #f0f0f0',
              borderRadius: '6px'
            }}>
              <Table
                columns={columns}
                dataSource={filteredProducts.map(product => ({
                  ...product,
                  key: `${product.product_id}`,
                }))}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                size="small"
                // scroll={{ x: 1200 ,y: 400}}
                loading={loading}
                style={{ 
                  height: '100%',
                  overflow: 'auto'
                }}
              />
            </div>
          );
  };

  return (
    <div className="branch-product-matrix branch-product-matrix-page" style={{ 
      padding: 16,
      minHeight: 'calc(100vh - 60px)'
    }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Şube Ürün Yönetimi</Title>
                           <div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
                style={{ 
                fontWeight: 'bold', 
                fontSize: 16, 
                padding: '12px 10px',
                height: 'auto',
                minHeight: '20px'
              }}
            >
              Yeni Şube
            </Button>
           
          </div>
      </div>

      {/* Filtreler */}
      <Card title="Filtreler" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Text strong>Şube Filtresi:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Tüm şubeler"
              allowClear
              value={selectedBranch}
              onChange={handleBranchFilter}
            >
              {branches.map(branch => (
                <Option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Text strong>Kategori Filtresi:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Tüm kategoriler"
              allowClear
              value={selectedCategory}
              onChange={handleCategoryFilter}
            >
              {allCategories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <Button 
              onClick={clearFilters}
              style={{ width: '100%', marginTop: 32 }}
            >
              Filtreleri Temizle
            </Button>
          </Col>
        </Row>
      </Card>

             {/* Ürün Tablosu */}
       <Card title="Ürünler" size="small">
         {renderProductTable()}
       </Card>

       {/* Add/Edit Branch Modal */}
       <Modal
         open={modalVisible}
         title={editingBranch ? 'Şube Güncelle' : 'Yeni Şube'}
         onCancel={() => setModalVisible(false)}
         onOk={handleSave}
         okText={editingBranch ? 'Güncelle' : 'Ekle'}
         cancelText="İptal"
       >
         <Form form={form} layout="vertical">
           <Form.Item
             name="name"
             label="Şube Adı"
             rules={[{ required: true, message: 'Şube adı zorunludur' }]}
           >
             <Input />
           </Form.Item>
           <Form.Item
             name="adress"
             label="Adres"
           >
             <Input />
           </Form.Item>
         </Form>
       </Modal>
     </div>
   );
 };

export default BranchProductMatrix;