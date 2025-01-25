import React, { useState, useEffect, useContext, useMemo } from 'react';
import { HolderOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Table } from 'antd';

const RowContext = React.createContext({});

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

const columns = [
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

const DragAndDropTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModified, setIsModified] = useState(false); // Değişiklik durumu için state

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/productsBySiraid');
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setData(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setData((prevState) => {
        const activeIndex = prevState.findIndex((record) => record.product_id === active?.id);
        const overIndex = prevState.findIndex((record) => record.product_id === over?.id);
        const newData = arrayMove(prevState, activeIndex, overIndex);
        setIsModified(true); // Değişiklik yapıldığında true
        return newData;
      });
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/products/yeniSira', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: data }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      fetchData();
      setIsModified(false); // Kaydettikten sonra değişiklik durumu sıfırlanır
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ position: 'relative' }}>
      {/* Kaydet Butonu */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button type="primary" onClick={handleSave} disabled={!isModified}>
          Kaydet
        </Button>
      </div>

      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext items={data.map((item) => item.product_id)} strategy={verticalListSortingStrategy}>
          <Table
            rowKey="product_id"
            components={{ body: { row: Row } }}
            columns={columns}
            dataSource={data}
            pagination={{
          
              pageSizeOptions: ['5', '10', '20', '50'], // Seçenekler
              showSizeChanger: true,
              defaultPageSize: 8 , // Varsayılan satır sayısı
              responsive: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`, // Toplam veri sayısını gösterir
            }}          />
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DragAndDropTable;
