import React, { useState, useEffect, useContext, useMemo } from 'react';
import { HolderOutlined, UpOutlined, DownOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Table, Card, Space } from 'antd';
import { usePermissions } from '../../common/hooks/usePermissions';

const API_URL = import.meta.env.VITE_API_URL;

const RowContext = React.createContext({});

// Ekran boyutunu algılayan hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const DragHandle = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={<HolderOutlined />}
      style={{ cursor: 'move' }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

const MobileSortButtons = ({ index, totalItems, onMoveUp, onMoveDown }) => (
  <Space>
    <Button
      type="text"
      size="small"
      icon={<UpOutlined />}
      disabled={index === 0}
      onClick={() => onMoveUp(index)}
    />
    <Button
      type="text"
      size="small"
      icon={<DownOutlined />}
      disabled={index === totalItems - 1}
      onClick={() => onMoveDown(index)}
    />
  </Space>
);

const Row = (props) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });

  const style = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  const contextValue = useMemo(() => ({ setActivatorNodeRef, listeners }), [setActivatorNodeRef, listeners]);

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
};

const UnifiedSortTable = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [view, setView] = useState('categories'); // 'categories' or 'products'
  const isMobile = useIsMobile();
  
  // İzin kontrolü
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      console.log('🔄 Kategori sıralama verileri getiriliyor...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token bulunamadı');
        setError('Token bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }
      console.log('✅ Token bulundu, API çağrısı yapılıyor...');

      const response = await fetch(`${API_URL}/api/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else if (response.status === 403) {
          setError('Bu işlem için yetkiniz bulunmuyor.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        return;
      }
      
      const result = await response.json();
      
      const sortedData = result.sort((a, b) => (a.sira_id || 0) - (b.sira_id || 0));
      
      const categoriesWithParentNames = sortedData.map(category => {
        const parentCategory = result.find(cat => cat.category_id === category.parent_id);
        return {
          ...category,
          parent_category_name: parentCategory ? parentCategory.category_name : null
        };
      });
      
      setCategoryData(categoriesWithParentNames);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsForCategory = async (categoryId) => {
    try {
      setLoading(true);
      console.log(`🔄 Kategori #${categoryId} için ürün verileri getiriliyor...`);
      console.log(`🔍 API URL: ${API_URL}/api/admin/productsByCategory/${categoryId}`);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token bulunamadı');
        setError('Token bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/productsByCategory/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`❌ API yanıt hatası: ${response.status} ${response.statusText}`);
        if (response.status === 401) {
          setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else if (response.status === 403) {
          setError('Bu işlem için yetkiniz bulunmuyor.');
        } else if (response.status === 404) {
          setError(`Kategori #${categoryId} için ürün bulunamadı.`);
          console.error(`❌ 404 Not Found: Kategori #${categoryId} için ürün bulunamadı`);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
          console.error(`❌ API hata detayı:`, errorData);
          throw new Error(errorMessage);
        }
        return;
      }
      
      const result = await response.json();
      console.log(`✅ API yanıt alındı:`, result);
      
      if (!result || result.length === 0) {
        console.log(`ℹ️ Kategori #${categoryId} için ürün bulunamadı`);
        setProductData([]);
        setSelectedCategory(categoryData.find(cat => cat.category_id === categoryId));
        setView('products');
        return;
      }
      
      // Sıra ID'ye göre sırala
      const sortedProducts = result.sort((a, b) => (a.sira_id || 0) - (b.sira_id || 0));
      setProductData(sortedProducts);
      setSelectedCategory(categoryData.find(cat => cat.category_id === categoryId));
      setView('products');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onCategoryDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setCategoryData((prevState) => {
        const activeIndex = prevState.findIndex((record) => record.category_id === active?.id);
        const overIndex = prevState.findIndex((record) => record.category_id === over?.id);
        const newData = arrayMove(prevState, activeIndex, overIndex);
        setIsModified(true);
        return newData;
      });
    }
  };

  const onProductDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setProductData((prevState) => {
        const activeIndex = prevState.findIndex((record) => record.product_id === active?.id);
        const overIndex = prevState.findIndex((record) => record.product_id === over?.id);
        const newData = arrayMove(prevState, activeIndex, overIndex);
        setIsModified(true);
        return newData;
      });
    }
  };

  // Mobil için yukarı taşıma - Kategori
  const handleCategoryMoveUp = (index) => {
    if (index > 0) {
      setCategoryData((prevState) => {
        const newData = [...prevState];
        [newData[index], newData[index - 1]] = [newData[index - 1], newData[index]];
        setIsModified(true);
        return newData;
      });
    }
  };

  // Mobil için aşağı taşıma - Kategori
  const handleCategoryMoveDown = (index) => {
    if (index < categoryData.length - 1) {
      setCategoryData((prevState) => {
        const newData = [...prevState];
        [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
        setIsModified(true);
        return newData;
      });
    }
  };

  // Mobil için yukarı taşıma - Ürün
  const handleProductMoveUp = (index) => {
    if (index > 0) {
      setProductData((prevState) => {
        const newData = [...prevState];
        [newData[index], newData[index - 1]] = [newData[index - 1], newData[index]];
        setIsModified(true);
        return newData;
      });
    }
  };

  // Mobil için aşağı taşıma - Ürün
  const handleProductMoveDown = (index) => {
    if (index < productData.length - 1) {
      setProductData((prevState) => {
        const newData = [...prevState];
        [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
        setIsModified(true);
        return newData;
      });
    }
  };

  const handleSaveCategories = async () => {
    try {
      setSaving(true);
      
      const updatedData = categoryData.map((category, index) => ({
        ...category,
        sira_id: index + 1
      }));

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/categories/updateSira`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ categories: updatedData }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else if (response.status === 403) {
          setError('Bu işlem için yetkiniz bulunmuyor.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        return;
      }
      
      console.log('✅ Kategori sıralaması başarıyla kaydedildi');
      setCategoryData(updatedData);
      setIsModified(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProducts = async () => {
    try {
      setSaving(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/products/updateCategorySira`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          products: productData,
          category_id: selectedCategory.category_id
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else if (response.status === 403) {
          setError('Bu işlem için yetkiniz bulunmuyor.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        return;
      }
      
      console.log('✅ Ürün sıralaması başarıyla kaydedildi');
      setIsModified(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToCategories = () => {
    setView('categories');
    setSelectedCategory(null);
    setIsModified(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // İzin kontrolü
  if (!hasPermission('categories', 'sort') && !hasPermission('products', 'sort')) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <h3>Erişim Yetkisi Yok</h3>
        <p>Kategori ve ürün sıralama sayfasına erişim yetkiniz bulunmamaktadır.</p>
        <p>Bu sayfayı kullanabilmek için gerekli yetkilere sahip olmanız gerekmektedir.</p>
      </div>
    );
  }

  // Kategori görünümü için sütunlar
  const categoryColumns = [
    {
      key: 'sort',
      align: 'center',
      width: 80,
      render: () => <DragHandle />,
    },
    {
      title: 'Category Name',
      dataIndex: 'category_name',
    },
    {
      title: 'Parent Category',
      dataIndex: 'parent_category_name',
      render: (text) => text || 'Ana Kategori',
    },
    {
      title: 'Sıra ID',
      dataIndex: 'sira_id',
    },
    {
      title: 'Ürünler',
      key: 'products',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<RightOutlined />}
          onClick={() => fetchProductsForCategory(record.category_id)}
        />
      ),
    },
  ];

  // Ürün görünümü için sütunlar
  const productColumns = [
    {
      key: 'sort',
      align: 'center',
      width: 80,
      render: () => <DragHandle />,
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Price',
      dataIndex: 'price',
    },
    {
      title: 'Sıra ID',
      dataIndex: 'sira_id',
    },
  ];

  // Mobil görünüm - Kategori
  if (isMobile && view === 'categories') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <Button 
            type="primary" 
            onClick={handleSaveCategories} 
            disabled={!isModified || saving}
            loading={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>

        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {categoryData.map((category, index) => (
            <Card 
              key={category.category_id} 
              style={{ marginBottom: '8px' }}
              bodyStyle={{ padding: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {category.category_name}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {category.parent_category_name || 'Ana Kategori'}
                  </div>
                  <div style={{ color: '#999', fontSize: '12px' }}>
                    Sıra: {category.sira_id || 'Belirtilmemiş'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <MobileSortButtons
                    index={index}
                    totalItems={categoryData.length}
                    onMoveUp={handleCategoryMoveUp}
                    onMoveDown={handleCategoryMoveDown}
                  />
                  <Button
                    type="primary"
                    icon={<RightOutlined />}
                    style={{ marginLeft: '8px' }}
                    onClick={() => fetchProductsForCategory(category.category_id)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Mobil görünüm - Ürün
  if (isMobile && view === 'products') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
          <Button 
            icon={<LeftOutlined />} 
            onClick={handleBackToCategories}
          >
            Geri Dön
          </Button>
          <Button 
            type="primary" 
            onClick={handleSaveProducts} 
            disabled={!isModified || saving || productData.length === 0}
            loading={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h3>Kategori: {selectedCategory?.category_name}</h3>
        </div>

        {productData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <p>Bu kategoride henüz ürün bulunmamaktadır.</p>
            <p>Ürünler ekranından bu kategoriye ürün ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {productData.map((product, index) => (
            <Card 
              key={product.product_id} 
              style={{ marginBottom: '8px' }}
              bodyStyle={{ padding: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {product.product_name}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {product.description || 'Açıklama yok'}
                  </div>
                  <div style={{ color: '#999', fontSize: '12px' }}>
                    Fiyat: {product.price} TL | Sıra: {product.sira_id || 'Belirtilmemiş'}
                  </div>
                </div>
                <MobileSortButtons
                  index={index}
                  totalItems={productData.length}
                  onMoveUp={handleProductMoveUp}
                  onMoveDown={handleProductMoveDown}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    );
  }

  // Desktop görünüm - Kategori
  if (view === 'categories') {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <Button 
            type="primary" 
            onClick={handleSaveCategories} 
            disabled={!isModified || saving}
            loading={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>

        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onCategoryDragEnd}>
          <SortableContext items={categoryData.map((item) => item.category_id)} strategy={verticalListSortingStrategy}>
            <Table
              rowKey="category_id"
              components={{ body: { row: Row } }}
              columns={categoryColumns}
              dataSource={categoryData}
              scroll={{ x: 900, y: 400 }}
              loading={saving}
              pagination={{
                pageSizeOptions: ['5', '10', '20', '50'],
                showSizeChanger: true,
                defaultPageSize: 8,
                responsive: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
          </SortableContext>
        </DndContext>
      </div>
    );
  }

  // Desktop görünüm - Ürün
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
        <Button 
          icon={<LeftOutlined />} 
          onClick={handleBackToCategories}
        >
          Geri Dön
        </Button>
        <Button 
          type="primary" 
          onClick={handleSaveProducts} 
          disabled={!isModified || saving || productData.length === 0}
          loading={saving}
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h3>Kategori: {selectedCategory?.category_name}</h3>
      </div>

      {productData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p>Bu kategoride henüz ürün bulunmamaktadır.</p>
          <p>Ürünler ekranından bu kategoriye ürün ekleyebilirsiniz.</p>
        </div>
      ) : (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onProductDragEnd}>
          <SortableContext items={productData.map((item) => item.product_id)} strategy={verticalListSortingStrategy}>
            <Table
              rowKey="product_id"
              components={{ body: { row: Row } }}
              columns={productColumns}
              dataSource={productData}
              scroll={{ x: 900, y: 400 }}
              loading={saving}
              pagination={{
                pageSizeOptions: ['5', '10', '20', '50'],
                showSizeChanger: true,
                defaultPageSize: 8,
                responsive: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default UnifiedSortTable;
