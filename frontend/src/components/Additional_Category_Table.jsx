import React, { useState, useEffect } from 'react';
import '../css/categories.css';
import { Table, Button, message, Modal } from 'antd';
import { MinusSquareOutlined, PlusCircleOutlined, PlusOutlined, EditOutlined, DeleteTwoTone } from '@ant-design/icons';
import '../css/tableSizeManager.css';


const { confirm } = Modal;
const API_URL = import.meta.env.VITE_API_URL;

import ModalForm from './CategoryFormModal';
import EditCategoryModal from './EditCategoryModal';
const App = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modalın görünürlük durumu
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parentId, setParentId] = useState(null); // Alt kategori için parentId

  useEffect(() => {
    fetchCategories();
  }, []);



  const handleAddSubCategory = (parentId) => {
    setParentId(parentId);
    setIsModalVisible(true);
  };

  const handleDelete = async (categoryId) => {
    confirm({
      title: 'Kategori Silinsin mi?',
      content: 'Bu kategoriyi silmek istediğinize emin misiniz?',
      okText: 'Evet, Sil',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          const res = await fetch(`${API_URL}/api/admin/categories/${categoryId}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            message.success('Kategori silindi!');
            fetchCategories();
          } else {
            const data = await res.json();
            message.error(data.error || 'Silme işlemi başarısız!');
          }
        } catch (err) {
          message.error('Silme işlemi başarısız!');
        }
      },
    });
  };

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <span style={{ marginLeft: `${record.depth * 20}px` }}>{text}</span> // Depth'e göre margin-left
    ),
  },
  {
    title: 'Action',
    dataIndex: '',
    key: 'x',
    width: '30%',
    render: (record) => (
      <div className='action-buttons-container'>
        <Button style={{ color: 'blue' }} onClick={() => handleAddSubCategory(record.id)}><PlusOutlined/> Add</Button>
        <Button style={{ color: 'green' }} onClick={() => showEditModal(record)}><EditOutlined/> Edit</Button>
        <Button style={{ color: 'red' , marginLeft: '20px' }} onClick={() => handleDelete(record.id)}><DeleteTwoTone/> Delete</Button>
      </div>
    ),
  },
];

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/categories`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const categoriesJson = await response.json();
      const formattedData = categoriesJson.map((category) => ({
        id: category.category_id,
        name: category.category_name,
        parent_id: category.parent_id,
        imageUrl: category.image_url,
      }));
      
      const treeData = buildCategoryTree(formattedData);
      setData(treeData);
    } catch (error) {
      message.error('Kategoriler alınırken bir hata oluştu!');
    }
  };

  const buildCategoryTree = (categories) => {
    const categoryMap = {};
    const tree = [];

    // Kategorileri haritalamak
    categories.forEach((category) => {
      categoryMap[category.id] = { ...category, children: [], depth: 0 }; // depth (seviye) 0 olarak başlat
    });

    // Ağaç yapısını oluşturmak
    categories.forEach((category) => {
      if (category.parent_id === null) {
        tree.push(categoryMap[category.id]);
      } else {
        const parent = categoryMap[category.parent_id];
        if (parent) {
          categoryMap[category.id].depth = parent.depth + 1; // Derinliği bir üst kategoriye göre arttır
          parent.children.push(categoryMap[category.id]);
        }
      }
    });

    return tree;
  };

  // Modal'ı açma işlevi
  const showModal = () => {
    setParentId(null); // Ana kategori eklerken parentId null
    setIsModalVisible(true);
  };

  // Modal'ı kapatma işlevi
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Form submit olduğunda çalışacak işlev
  const handleOk = () => {
    fetchCategories();
    setIsModalVisible(false); // Form başarıyla submit edildikten sonra modalı kapat
  };

  const showEditModal = (category) => {
    setSelectedCategory(category);
    setIsEditModalVisible(true);
  };

  const handleEditOk = () => {
    setIsEditModalVisible(false);
    // Güncellenen verileri yeniden fetch et veya güncelle
  };

  return (
    <div>
      <h2>Kategoriler ve Alt Kategoriler</h2>
      <Button type="primary" onClick={showModal} style={{ marginBottom: '10px', marginTop: '10px', position: 'relative' }}>
        <PlusOutlined/> Create a Category
      </Button>
      {/* ModalForm'u burada kullanıyoruz */}
      <ModalForm
        visible={isModalVisible}    // Modalın görünürlük durumu
        onCancel={handleCancel}      // Cancel butonuna basıldığında çalışacak işlev
        onOk={handleOk}              // Form submit edildiğinde çalışacak işlev
        parentId={parentId}          // Alt kategori için parentId
      />
      <EditCategoryModal
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleEditOk}
        category={selectedCategory} // Düzenlenecek kategori bilgisi
      />
     <Table
  columns={columns}
  className='ant-table'
  dataSource={data}
  rowKey="id"
  pagination={false}
  scroll={{ y: 200 }} // 200px dene
  expandable={{
    rowExpandable: record => record.children.length > 0,
    expandIcon: ({ expanded, onExpand, record }) =>
      record.children.length > 0 ? (
        <span onClick={e => onExpand(record, e)} style={{ cursor: 'pointer', marginRight: '10px', fontSize: '15px', color: 'blue' }}>
          {expanded ? <MinusSquareOutlined /> : <PlusCircleOutlined />}
        </span>
      ) : null,
  }}
/>
    </div>
  );
};

export default App;