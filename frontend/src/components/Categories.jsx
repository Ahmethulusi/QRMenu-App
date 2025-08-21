import React, { useState, useEffect } from 'react';
import '../css/categories.css';
import { Table, Button, message, Modal, Spin } from 'antd';
import { MinusSquareOutlined, PlusCircleOutlined, PlusOutlined, EditOutlined, DeleteTwoTone } from '@ant-design/icons';
import '../css/tableSizeManager.css';


const { confirm } = Modal;
const API_URL = import.meta.env.VITE_API_URL;

import ModalForm from './CategoryFormModal';
import EditCategoryModal from './EditCategoryModal';
const Categories = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modalın görünürlük durumu
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parentId, setParentId] = useState(null); // Alt kategori için parentId
  const [loading, setLoading] = useState(true); // Yükleme durumu
  
  // İzin kontrolü - geçici olarak kaldırıldı
  // const { hasPermission, loading: permissionsLoading } = usePermissions();
  
  // Toplam loading durumu
  const isAnyLoading = loading; // || permissionsLoading;
  
  // Geçici olarak tüm izinleri true yap
  const hasPermission = (resource, action) => true;

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
          setLoading(true); // Silme işlemi sırasında loading göster
          const token = localStorage.getItem('token');
          
          if (!token) {
            message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            window.location.href = '/login';
            return;
          }
          
          const res = await fetch(`${API_URL}/api/admin/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!res.ok) {
            if (res.status === 401) {
              message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
              localStorage.removeItem('token');
              window.location.href = '/login';
              return;
            }
            const data = await res.json();
            message.error(data.error || 'Silme işlemi başarısız!');
          } else {
            message.success('Kategori silindi!');
            await fetchCategories(); // Kategorileri yeniden yükle
          }
        } catch (err) {
          message.error('Silme işlemi başarısız!');
        } finally {
          setLoading(false); // Loading'i kapat
        }
      },
    });
  };

  // Columns'ı component içinde tanımla ve hasPermission'ı kullan
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
      render: (record) => {
        try {
          return (
            <div className='action-buttons-container' style={{ display: 'flex', gap: '5px' }}>
              {hasPermission('categories', 'create') && (
                <Button 
                  style={{ color: 'blue' }} 
                  onClick={() => handleAddSubCategory(record.id)}
                  disabled={isAnyLoading}
                >
                  <PlusOutlined/> Add
                </Button>
              )}
              {hasPermission('categories', 'update') && (
                <Button 
                  style={{ color: 'green' }} 
                  onClick={() => showEditModal(record)}
                  disabled={isAnyLoading}
                >
                  <EditOutlined/> Edit
                </Button>
              )}
              {hasPermission('categories', 'delete') && (
                <Button 
                  style={{ color: 'red' }} 
                  onClick={() => handleDelete(record.id)}
                  disabled={isAnyLoading}
                >
                  <DeleteTwoTone/> Delete
                </Button>
              )}
            </div>
          );
        } catch (error) {
          console.error('Render error in action column:', error);
          return <div>Hata oluştu</div>;
        }
      },
    },
  ];

  const fetchCategories = async () => {
    setLoading(true); // Yükleme başlat
    try {
      // Önce localStorage'dan token'ı al, yoksa sessionStorage'dan dene
      let token = localStorage.getItem('token');
      if (!token) {
        token = sessionStorage.getItem('token');
      }
      
      console.log('Token durumu:', token ? 'Mevcut' : 'Bulunamadı');
      console.log('Token kaynağı:', localStorage.getItem('token') ? 'localStorage' : sessionStorage.getItem('token') ? 'sessionStorage' : 'Hiçbiri');
      
      if (!token) {
        console.log('Token bulunamadı, login sayfasına yönlendiriliyor...');
        message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        // Login sayfasına yönlendir
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch(`${API_URL}/api/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('401 hatası alındı, token geçersiz');
          message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        throw new Error('Network response was not ok');
      }
      
      const categoriesJson = await response.json();
      // Kategorileri sira_id'ye göre sırala
      const sortedCategories = [...categoriesJson].sort((a, b) => (a.sira_id || 0) - (b.sira_id || 0));
      
      const formattedData = sortedCategories.map((category) => ({
        id: category.category_id,
        name: category.category_name,
        parent_id: category.parent_id,
        imageUrl: category.image_url,
        sira_id: category.sira_id || 0, // sira_id'yi ekleyelim, yoksa 0 olsun
      }));
      
      const treeData = buildCategoryTree(formattedData);
      setData(treeData);
    } catch (error) {
      console.error('Fetch hatası:', error);
      message.error('Kategoriler alınırken bir hata oluştu!');
    } finally {
      setLoading(false); // Yükleme bitti
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

    // Ana kategorileri sira_id'ye göre sırala
    tree.sort((a, b) => (a.sira_id || 0) - (b.sira_id || 0));
    
    // Alt kategorileri de sira_id'ye göre sırala
    for (const category of tree) {
      if (category.children && category.children.length > 0) {
        category.children.sort((a, b) => (a.sira_id || 0) - (b.sira_id || 0));
      }
    }

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
  const handleOk = async () => {
    await fetchCategories(); // Kategorileri yeniden yükle
    setIsModalVisible(false); // Form başarıyla submit edildikten sonra modalı kapat
  };

  const showEditModal = (category) => {
    setSelectedCategory(category);
    setIsEditModalVisible(true);
  };

  const handleEditOk = async () => {
    await fetchCategories(); // Kategorileri yeniden fetch et
    setIsEditModalVisible(false);
  };

  return (
    <div>
      <h2>Kategoriler ve Alt Kategoriler</h2>
      {hasPermission('categories', 'create') && (
        <Button 
          type="primary" 
          onClick={showModal} 
          style={{ marginBottom: '10px', marginTop: '10px', position: 'relative' }}
          disabled={isAnyLoading}
        >
          <PlusOutlined/> Create a Category
        </Button>
      )}
      
      {/* Loading durumu için spinner */}
      {isAnyLoading && (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#666' }}>Kategoriler yükleniyor...</div>
        </div>
      )}
      
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
      
      {/* Table sadece loading false olduğunda göster */}
      {!isAnyLoading && (
        <>
          {data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#666' }}>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>Henüz kategori bulunmuyor</div>
              <div style={{ fontSize: '14px' }}>İlk kategorinizi oluşturmak için yukarıdaki butona tıklayın</div>
            </div>
          ) : (
            <Table
              columns={columns}
              className='ant-table'
              dataSource={data}
              rowKey="id"
              pagination={false}
              scroll={{ y: 200 }} // 200px dene
              loading={isAnyLoading}
              rowClassName={(record) => {
                // Alt kategoriler için daha koyu arka plan
                if (record.depth > 0) {
                  return 'subcategory-row';
                }
                return '';
              }}
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
          )}
        </>
      )}
    </div>
  );
};

export default Categories;