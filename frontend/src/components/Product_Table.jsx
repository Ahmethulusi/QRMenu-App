import React, { useEffect, useState } from 'react';
import { Table, Upload, Button, Popover ,Switch, message,Popconfirm, Spin} from 'antd';
import { UploadOutlined ,PlusOutlined ,EditOutlined,DeleteTwoTone,EyeFilled,EyeInvisibleFilled} from '@ant-design/icons';
import CreateFormModal from './ProductFormModal';
import ExcelImportButton from './ExcelImportButton';
import EditFormModal from './EditModal';
import { apiGet, apiPut, apiDelete, apiPost } from '../utils/api';
import '../css/tableSizeManager.css';

const API_URL = import.meta.env.VITE_API_URL;

const Product_Table = () => {
  const [data, setData] = useState([]);  // Verileri burada tutacağız
  const [loading, setLoading] = useState(true);  // Yüklenme durumu için
  const [error, setError] = useState(null);  // Hata durumunu tutmak için
  const [nameFilters, setNameFilters] = useState([]);  // Filtre değerleri burada tutulur
  const [categoryFilters, setCategoryFilters] = useState([]);  // Filtre değerleri burada tutulur
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false); // Modalın görünürlük durumu
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Modalın görünürlük durumu
  const [recordToEdit, setRecordToEdit] = useState(null); // Düzenlenecek kayıt bilgileri
  const [refreshing, setRefreshing] = useState(false); // Sadece tablo yenileme için

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      console.log('🔄 Ürünler getiriliyor...');
      const datas = await apiGet('/api/admin/products');
      console.log('✅ API yanıtı:', datas);

      if (!datas || !Array.isArray(datas)) {
        throw new Error('API geçersiz veri döndürdü');
      }

      const formattedData = datas.map((item, index) => {
        const imageUrl = item.image_url ? `${API_URL}/images/${item.image_url}` : null;

        return {
          key: index, 
          image: imageUrl ? (
            <Popover content={<img src={imageUrl} style={{ width: '200px', height: '150px' }} />} title="Resim Önizleme" onClick={() => window.open(imageUrl)}>
              <img src={imageUrl} style={{ width: '50px', height: '50px', cursor: 'pointer' }} />
            </Popover>
          ) : (
            <UploadImageButton productId={item.product_id} onUploadSuccess={() => refreshTable()} />
          ),
          id: item.product_id,
          name: item.product_name,
          description: item.description,
          price: item.price,
          category: item.Category ? item.Category.category_name : 'Kategori Yok',
          category_id: item.category_id, // Kategori ID'sini ekle
          status: item.is_available,
          showcase: item.is_selected,
        };
      });

      console.log('✅ Formatlanmış veri:', formattedData);
      setData(formattedData);

      // uploadCategoriesToModal(datas);
      const uniqueNames = [...new Set(datas.map(item => item.product_name))];
      const filteredNames = uniqueNames.map(name => ({ text: name, value: name }));
      setNameFilters(filteredNames);  // Filtreleri ayarla

      const uniqueCategories = [...new Set(datas.map(item => item.Category ? item.Category.category_name : 'Kategori Yok'))];
      const filteredCategories = uniqueCategories.map(category => ({ text: category, value: category }));
      setCategoryFilters(filteredCategories);  // Filtreleri ayarla

    } catch (error) {
      console.error('❌ Ürünler getirilirken hata:', error);
      console.error('❌ Hata detayı:', error.message);
      setError(`Veriler alınamadı: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sadece tabloyu yenilemek için
  const refreshTable = async () => {
    setRefreshing(true);
    await fetchData(false);
  };

  const handleShowcaseToggle = async (productId, newShowcaseState) => {
    try {
      await apiPut(`/api/admin/products/updateShowcase/${productId}`, { showcase: newShowcaseState });
      
      setData((prevdatas) =>
        prevdatas.map((product) =>
          product.id === productId
            ? { ...product, showcase: newShowcaseState }
            : product
        )
      );    
    } catch (error) {
      message.error('Bir hata oluştu: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDelete(`/api/admin/products/${id}`);
      setData(prev => prev.filter(item => item.id !== id));
      message.success('Ürün başarıyla silindi!');
    } catch (error) {
      console.error('Silme işlemi başarısız:', error);
      message.error('Ürün silinemedi!');
    }
  };

  const handleStatusToggle = async (productId, newStatus) => {
    try {
      await apiPut(`/api/admin/products/updateStatus/${productId}`, { status: newStatus });
      
      setData((prevdatas) =>
        prevdatas.map((product) =>
          product.id === productId
            ? { ...product, status: newStatus }
            : product
        )
      );
    } catch (error) {
      message.error('Bir hata oluştu: ' + error.message);
    }
  };

  // Modal'ı açma işlevi
  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };
  
  const showEditModal = (record) => {
    console.log("Edit record:", record); // Debug için
    
    // Kategori ID'sini bulmak için data array'inden ürünü bul
    const originalProduct = data.find(item => item.id === record.id);
    
    setIsEditModalVisible(true);
    setRecordToEdit({
      product_id: record.id,
      product_name: record.name,
      description: record.description,
      price: record.price,
      category_id: originalProduct ? originalProduct.category_id : null, // Kategori ID'sini doğru şekilde al
      is_available: record.status, // Boolean değer olarak
      is_selected: record.showcase, // Boolean değer olarak
      image_url: record.image && record.image.props && record.image.props.children && 
                record.image.props.children.props ? 
                record.image.props.children.props.src : null
    });
  };

  // Modal'ı kapatma işlevi
  const handleCreateCancel = () => {
    setIsCreateModalVisible(false);
  };

  const handleEditCancel = () => {  
    setIsEditModalVisible(false);
  };

  // Form submit olduğunda çalışacak işlev
  const handleOk = () => {
    refreshTable(); // Sadece tabloyu yenile
    setIsCreateModalVisible(false); // Form başarıyla submit edildikten sonra modalı kapat
  };

  // Edit modal'ı kapatıldığında tabloyu yenile
  const handleEditOk = () => {
    refreshTable(); // Sadece tabloyu yenile
    setIsEditModalVisible(false);
  };

  const columns = (filterNames, categoryFilters) => [
    {
      title: 'Resim',
      dataIndex: 'image',
      key: 'image', 
      width:'13%'
    },
    {
      title: 'İsim',
      dataIndex: 'name',
      key: 'name',
      width: '10%',
      filters: filterNames,
      filterSearch: true,
      onFilter: (value, record) => record.name.includes(value),
    },
    {
      title: 'Açıklama',
      key: 'description',
      dataIndex: 'description',
      width: '20%',
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      defaultSortOrder: 'descend',
      width: '13%',
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      filters: categoryFilters,
      width: '14%',
      filterSearch: true,
      onFilter: (value, record) => record.category.includes(value),
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'id',
      width: '16%',
      render: (record) => (
        <div className='action-buttons-container'>
          <Button style={{ color: 'green' }} onClick={() => showEditModal(record)}>
            <EditOutlined /> Edit
          </Button>
          
          <Popconfirm
            title="Bu ürünü silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button style={{ color: 'red' }}>
              <DeleteTwoTone /> Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '8%',
      render: (status, record) => (
        <div className='status-container'>        
          {status ? (
            <Switch checked={true} onClick={() => handleStatusToggle(record.id, false)} />
          ) : (
            <Switch checked={false} onClick={() => handleStatusToggle(record.id, true)} />
          )}
        </div>
      ),
    },
    {
      title: 'Showcase',
      dataIndex: 'showcase',
      key: 'showcase',
      width: '8%',
      render: (showcase, record) => {
        return (
          <div className="showcase-icon">
            {showcase ? (
              <EyeFilled
                onClick={() => handleShowcaseToggle(record.id, false)}
                style={{ fontSize: '20px', cursor: 'pointer' }}
              />
            ) : (
              <EyeInvisibleFilled
                onClick={() => handleShowcaseToggle(record.id, true)}
                style={{
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'gray'
                }}
              />
            )}
          </div>
        );
      },
    },
  ];

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='table-content'>
      <Button type="primary" onClick={showCreateModal} style={{ marginBottom: '20px', position: 'relative' }}>
        <PlusOutlined/> Yeni
      </Button>

      <ExcelImportButton onSuccess={refreshTable} />

      {/* ModalForm'u burada kullanıyoruz */}
      <CreateFormModal
        visible={isCreateModalVisible}
        onCancel={handleCreateCancel}
        onOk={handleOk}
      />

      <EditFormModal
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
        onOk={handleEditOk}
        record={recordToEdit}
      />

      <Table
        className='ant-table'
        bordered={true}
        scroll={{x: 900, y: 400 }}
        columns={columns(nameFilters, categoryFilters)}
        dataSource={data}
        loading={loading || refreshing}
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50'],
          showSizeChanger: true,
          defaultPageSize: 5,
          responsive: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          position: ['bottomRight']
        }}
      />
    </div>
  );
};

// Resim yükleme bileşeni
const UploadImageButton = ({ productId, onUploadSuccess }) => {
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('resim', file);
    formData.append('productId', productId);
    
    try {
      // FormData için özel API çağrısı
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/products/updateImageUrl`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Resim yüklemede bir hata oluştu');
      }

      const data = await response.json();
      console.log('Resim başarıyla yüklendi', data);
      onUploadSuccess();
    } catch (error) {
      console.error('Resim yüklemede bir hata oluştu', error);
      message.error('Resim yükleme başarısız!');
    }
  };

  return (
    <Upload
      accept="image/*"
      beforeUpload={() => false}
      onChange={info => handleUpload(info)}
      showUploadList={false}
    >
      <Button icon={<UploadOutlined />} style={{ width: '50px', height: '50px' }}>
        +
      </Button>
    </Upload>
  );
};

export default Product_Table;




