import React, { useState, useEffect, useContext, useMemo } from 'react';
import { HolderOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Table, Card, Space } from 'antd';

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

const columns = [
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
];

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

const CategorySortTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
      
      setData(categoriesWithParentNames);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setData((prevState) => {
        const activeIndex = prevState.findIndex((record) => record.category_id === active?.id);
        const overIndex = prevState.findIndex((record) => record.category_id === over?.id);
        const newData = arrayMove(prevState, activeIndex, overIndex);
        setIsModified(true);
        return newData;
      });
    }
  };

  // Mobil için yukarı taşıma
  const handleMoveUp = (index) => {
    if (index > 0) {
      setData((prevState) => {
        const newData = [...prevState];
        [newData[index], newData[index - 1]] = [newData[index - 1], newData[index]];
        setIsModified(true);
        return newData;
      });
    }
  };

  // Mobil için aşağı taşıma
  const handleMoveDown = (index) => {
    if (index < data.length - 1) {
      setData((prevState) => {
        const newData = [...prevState];
        [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
        setIsModified(true);
        return newData;
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updatedData = data.map((category, index) => ({
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
      setData(updatedData);
      setIsModified(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Mobil görünüm
  if (isMobile) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <Button 
            type="primary" 
            onClick={handleSave} 
            disabled={!isModified || saving}
            loading={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>

        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {data.map((category, index) => (
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
                <MobileSortButtons
                  index={index}
                  totalItems={data.length}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Desktop görünüm (mevcut sürükle-bırak)
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button 
          type="primary" 
          onClick={handleSave} 
          disabled={!isModified || saving}
          loading={saving}
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext items={data.map((item) => item.category_id)} strategy={verticalListSortingStrategy}>
          <Table
            rowKey="category_id"
            components={{ body: { row: Row } }}
            columns={columns}
            dataSource={data}
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
};

export default CategorySortTable; 