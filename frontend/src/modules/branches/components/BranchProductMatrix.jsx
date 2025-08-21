import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Switch, message, Row, Col, Card, List, Typography, Select, Modal, Form, Input } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import '../../../css/BranchProductMatrix.css';
import { apiGet, apiPut, apiPost } from '../../common/utils/api';

const { Title, Text } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;

const BranchProductMatrix = ({ businessId = 1 }) => { // Default değer ekledik
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
    if (businessId) { // businessId kontrolü ekledik
      fetchData();
    }
  }, [businessId]); // businessId dependency olarak ekledik

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching branch product matrix...'); // Debug için
      
      // YENİ ENDPOINT: Şube ürün matrisi getir
      const result = await apiGet('/api/branches/branch-product-matrix');
      
      setBranches(result);
      
      // Tüm kategorileri ve ürünleri topla
      const categories = new Set();
      const products = [];
      
      result.forEach(branch => {
        if (branch.categories && Array.isArray(branch.categories)) {
          branch.categories.forEach(category => {
            categories.add(category.category_name);
            if (category.products && Array.isArray(category.products)) {
              category.products.forEach(product => {
                // Ürünü sadece bir kez ekle
                if (!products.find(p => p.product_id === product.product_id)) {
                  products.push(product);
                }
              });
            }
          });
        }
      });
      
      setAllCategories(Array.from(categories));
      setAllProducts(products);
      setFilteredProducts(products);
      
      console.log('✅ Backend response:', {
        branchCount: result.length,
        categoryCount: categories.size,
        productCount: products.length
      });
      console.log('📋 Sample branch:', result[0]);
    } catch (error) {
      console.error('❌ Veri çekme hatası:', error);
      message.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // YENİ MANTIK: Filtreleme fonksiyonları  
  const handleBranchFilter = (branchId) => {
    setSelectedBranch(branchId);
    if (branchId) {
      // Şube seçildiğinde TÜM ürünleri göster, sadece o şubedeki durumlarını belirt
      const selectedBranchData = branches.find(b => b.branch_id === branchId);
      
      const productsWithBranchData = allProducts.map(product => {
        // Bu ürün bu şubede var mı kontrol et
        const branchProduct = selectedBranchData?.categories
          ?.flatMap(cat => cat.products)
          ?.find(bp => bp.product_id === product.product_id);
        
        return {
          ...product,
          // Şubede varsa branch fiyatını, yoksa ana fiyatı göster
          branch_price: branchProduct ? branchProduct.branch_price : product.list_price || product.price,
          // YENİ MANTIK: branchProduct varsa available=true, yoksa false (excluded)
          available: !!branchProduct, 
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
      
      if (editingBranch) {
        // Şube güncelleme
        await apiPut(`/api/branches/${branchId}`, { 
          ...values, 
          businessId: businessId 
        });
      } else {
        // Yeni şube oluşturma
        await apiPost('/api/branches', { 
          ...values, 
          businessId: businessId 
        });
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

      // apiPut kullanarak güncelleme isteği gönder (token otomatik eklenir)
      const result = await apiPut('/api/branches/branch-products', requestBody);
      console.log('✅ Başarılı response:', result);

      // YENİ MANTIK: State'leri güncelle
      if (row.available) {
        // Ürün dahil edildi - sadece local state'i güncelle
        setFilteredProducts(prevProducts => 
          prevProducts.map(product => {
            if (product.product_id === productId) {
              return {
                ...product,
                branch_price: row.branch_price,
                available: true,
              };
            }
            return product;
          })
        );
      } else {
        // Ürün exclude edildi - local state'de available: false yap
        setFilteredProducts(prevProducts => 
          prevProducts.map(product => {
            if (product.product_id === productId) {
              return {
                ...product,
                branch_price: row.branch_price,
                available: false,
              };
            }
            return product;
          })
        );
      }

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
        return apiPut('/api/branches/branch-products', {
          branch_id: selectedBranch,
          product_id: productId,
          price: row.branch_price,
          stock: row.available ? 1 : 0,
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
      padding: 16
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