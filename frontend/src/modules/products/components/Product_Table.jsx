import React, { useEffect, useState } from 'react';
import { Table, Upload, Button, Popover ,Switch, message,Popconfirm, Spin, Tag} from 'antd';
import { UploadOutlined ,PlusOutlined ,EditOutlined,DeleteTwoTone,EyeFilled,EyeInvisibleFilled, TagOutlined} from '@ant-design/icons';
import CreateFormModal from './ProductFormModal';
import ExcelImportButton from './ExcelImportButton';
import EditFormModal from './ProductEditModal';
import { apiGet, apiPut, apiDelete, apiPost } from '../../common/utils/api';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useCurrencies } from '../../currencies/hooks/useCurrencies';
import '../../tables_and_QR/css/tableSizeManager.css';

const API_URL = import.meta.env.VITE_API_URL;

const Product_Table = () => {
  const { currentLanguage } = useLanguage();
  const { currencies } = useCurrencies();
  const [data, setData] = useState([]);  // Verileri burada tutacağız
  const [originalData, setOriginalData] = useState([]);  // Orijinal API verisini burada tutacağız
  const [loading, setLoading] = useState(true);  // Yüklenme durumu için
  const [error, setError] = useState(null);  // Hata durumunu tutmak için
  const [nameFilters, setNameFilters] = useState([]);  // Filtre değerleri burada tutulur
  const [categoryFilters, setCategoryFilters] = useState([]);  // Filtre değerleri burada tutulur
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false); // Modalın görünürlük durumu
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Modalın görünürlük durumu
  const [recordToEdit, setRecordToEdit] = useState(null); // Düzenlenecek kayıt bilgileri
  const [refreshing, setRefreshing] = useState(false); // Sadece tablo yenileme için
  const [userPermissions, setUserPermissions] = useState(null); // Kullanıcı yetkileri
  const [selectedCurrency, setSelectedCurrency] = useState('USD'); // Seçili para birimi

  useEffect(() => {
    fetchData();
    fetchUserPermissions();
  }, [currentLanguage]);

  // Mevcut dilin varsayılan para birimini ayarla
  useEffect(() => {
    if (currentLanguage?.defaultCurrency?.code) {
      setSelectedCurrency(currentLanguage.defaultCurrency.code);
    }
  }, [currentLanguage]);

  // Fiyat dönüştürme fonksiyonu
  const convertPrice = (price, fromCurrency = 'TRY', toCurrency = selectedCurrency) => {
    if (!price || fromCurrency === toCurrency) return price;
    
    const fromCurr = currencies.find(c => c.code === fromCurrency);
    const toCurr = currencies.find(c => c.code === toCurrency);
    
    if (!fromCurr || !toCurr) return price;
    
    // USD üzerinden dönüştürme
    const priceInUSD = price / fromCurr.rate_to_usd;
    const convertedPrice = priceInUSD * toCurr.rate_to_usd;
    
    return convertedPrice;
  };

  // Para birimi sembolünü getir
  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  };

  const fetchData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const datas = await apiGet('/api/admin/products', currentLanguage?.code);

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
          category: item.category ? item.category.category_name : 'Kategori Yok',
          category_id: item.category_id, // Kategori ID'sini ekle
          labels: item.labels || [], // Etiketleri ekle
          status: item.is_available,
          showcase: item.is_selected,
        };
      });

      setData(formattedData);
      setOriginalData(datas); // Orijinal API verisini sakla

      // uploadCategoriesToModal(datas);
      const uniqueNames = [...new Set(datas.map(item => item.product_name))];
      const filteredNames = uniqueNames.map(name => ({ text: name, value: name }));
      setNameFilters(filteredNames);  // Filtreleri ayarla

            const uniqueCategories = [...new Set(datas.map(item =>
        item.category ? item.category.category_name : 'Kategori Yok'
      ))];
      const filteredCategories = uniqueCategories.map(category => ({ text: category, value: category }));
      setCategoryFilters(filteredCategories);  // Filtreleri ayarla

    } catch (error) {
      console.error('❌ Ürünler getirilirken hata:', error);
      setError(`Veriler alınamadı: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Kullanıcı yetkilerini getir
  const fetchUserPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/permissions/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.permissions);
      }
    } catch (error) {
      console.error('❌ Yetkiler yüklenirken hata:', error);
    }
  };

  // Yetki kontrol fonksiyonları
  const hasPermission = (resource, action) => {
    if (!userPermissions) return false;
    return userPermissions.some(perm => perm.resource === resource && perm.action === action);
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
      console.error('Showcase güncelleme hatası:', error);
      
      // Yetki hatası kontrolü
      if (error.status === 403) {
        message.error('Vitrin durumu güncellenemedi: Bu işlem için yetkiniz bulunmuyor!');
      } else if (error.status === 401) {
        message.error('Oturum süreniz dolmuş, lütfen tekrar giriş yapın!');
      } else {
        message.error(`Vitrin durumu güncellenemedi: ${error.message || 'Bilinmeyen hata'}`);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDelete(`/api/admin/products/${id}`);
      setData(prev => prev.filter(item => item.id !== id));
      message.success('Ürün başarıyla silindi!');
    } catch (error) {
      console.error('Silme işlemi başarısız:', error);
      
      // Yetki hatası kontrolü
      if (error.status === 403) {
        message.error('Bu işlem için yetkiniz bulunmuyor!');
      } else if (error.status === 401) {
        message.error('Oturum süreniz dolmuş, lütfen tekrar giriş yapın!');
      } else {
        message.error(`Ürün silinemedi: ${error.message || 'Bilinmeyen hata'}`);
      }
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
      console.error('Status güncelleme hatası:', error);
      
      // Yetki hatası kontrolü
      if (error.status === 403) {
        message.error('Ürün durumu güncellenemedi: Bu işlem için yetkiniz bulunmuyor!');
      } else if (error.status === 401) {
        message.error('Oturum süreniz dolmuş, lütfen tekrar giriş yapın!');
      } else {
        message.error(`Ürün durumu güncellenemedi: ${error.message || 'Bilinmeyen hata'}`);
      }
    }
  };

  // Modal'ı açma işlevi
  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };
  
  const showEditModal = (record) => {
    // Orijinal API verisinden ürünü bul
    const originalApiProduct = originalData.find(item => item.product_id === record.id);
    
    if (!originalApiProduct) {
      return;
    }
    
    setIsEditModalVisible(true);
    setRecordToEdit({
      product_id: originalApiProduct.product_id,
      product_name: originalApiProduct.product_name,
      description: originalApiProduct.description,
      price: originalApiProduct.price,
      category_id: originalApiProduct.category_id,
      stock: originalApiProduct.stock,
      calorie_count: originalApiProduct.calorie_count,
      cooking_time: originalApiProduct.cooking_time,
      carbs: originalApiProduct.carbs,
      protein: originalApiProduct.protein,
      fat: originalApiProduct.fat,
      allergens: originalApiProduct.allergens,
      recommended_with: originalApiProduct.recommended_with,
      is_available: originalApiProduct.is_available,
      is_selected: originalApiProduct.is_selected,
      labels: originalApiProduct.labels || [],
      image_url: originalApiProduct.image_url
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
      width: '15%',
      filters: filterNames,
      filterSearch: true,
      onFilter: (value, record) => record.name.includes(value),
    },
    {
      title: 'Açıklama',
      key: 'description',
      dataIndex: 'description',
      width: '18%',
      render: (text) => {
        if (!text) return '-';
        // Açıklamayı belirli bir karakter sayısıyla sınırla
        return (
          <div className="truncated-description" title={text}>
            {text.length > 70 ? `${text.substring(0, 70)}...` : text}
          </div>
        );
      }
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ cursor: 'pointer', userSelect: 'none' }}>Fiyat</span>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              padding: '4px 8px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              fontSize: '12px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#1890ff';
              e.target.style.boxShadow = '0 2px 4px rgba(24,144,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#d9d9d9';
              e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
            }}
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code}
              </option>
            ))}
          </select>
        </div>
      ),
      dataIndex: 'price',
      key: 'price',
      defaultSortOrder: 'descend',
      width: '15%',
      sorter: (a, b) => a.price - b.price,
      render: (price) => {
        const convertedPrice = convertPrice(price);
        return (
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {getCurrencySymbol(selectedCurrency)}{Math.round(convertedPrice)}
          </span>
        );
      },
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      filters: categoryFilters,
      width: '12%',
      filterSearch: true,
      onFilter: (value, record) => record.category.includes(value),
    },
    {
      title: 'Etiketler',
      dataIndex: 'labels',
      key: 'labels',
      width: '12%',
      render: (labels) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
          {labels && labels.length > 0 ? (
            labels.map(label => (
              <Tag
                key={label.label_id}
                color={label.color || '#007bff'}
                style={{ 
                  fontSize: '11px',
                  margin: '1px',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}
                icon={<TagOutlined style={{ fontSize: '10px' }} />}
              >
                {label.name}
              </Tag>
            ))
          ) : (
            <span style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
              Etiket yok
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'İşlemler',
      dataIndex: '',
      key: 'id',
      width: '14%',
      render: (record) => (
        <div className='action-buttons-container'>
          {hasPermission('products', 'update') && (
            <Button style={{ color: 'green' }} onClick={() => showEditModal(record)}>
              <EditOutlined /> Düzenle
            </Button>
          )}
          
          {hasPermission('products', 'delete') && (
            <Popconfirm
              title="Bu ürünü silmek istediğinize emin misiniz?"
              onConfirm={() => handleDelete(record.id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button style={{ color: 'red' }}>
                <DeleteTwoTone /> Sil
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: '8%',
      render: (status, record) => (
        <div className='status-container'>        
          {hasPermission('products', 'update') ? (
            <>
              {status ? (
                <Switch checked={true} onClick={() => handleStatusToggle(record.id, false)} />
              ) : (
                <Switch checked={false} onClick={() => handleStatusToggle(record.id, true)} />
              )}
            </>
          ) : (
            <span style={{ color: status ? 'green' : 'red' }}>
              {status ? 'Aktif' : 'Pasif'}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Vitrin',
      dataIndex: 'showcase',
      key: 'showcase',
      width: '8%',
      render: (showcase, record) => {
        return (
          <div className="showcase-icon">
            {hasPermission('products', 'update') ? (
              <>
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
              </>
            ) : (
              <span style={{ color: showcase ? 'green' : 'gray' }}>
                {showcase ? 'Vitrin' : 'Normal'}
              </span>
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
      {hasPermission('products', 'create') && (
        <Button type="primary" onClick={showCreateModal} style={{ marginBottom: '20px', position: 'relative' }}>
          <PlusOutlined/> Yeni
        </Button>
      )}

      {hasPermission('system', 'settings') && (
        <ExcelImportButton onSuccess={refreshTable} />
      )}

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
        scroll={{x: 900, y: 400}}
        columns={columns(nameFilters, categoryFilters)}
        dataSource={data}
        loading={loading || refreshing}
        rowClassName={() => 'fixed-height-row'}
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
        // HTTP status koduna göre hata mesajı
        if (response.status === 403) {
          throw new Error('Bu işlem için yetkiniz bulunmuyor!');
        } else if (response.status === 401) {
          throw new Error('Oturum süreniz dolmuş, lütfen tekrar giriş yapın!');
        } else {
          throw new Error(`Resim yüklemede bir hata oluştu (${response.status})`);
        }
      }

      const data = await response.json();
      onUploadSuccess();
    } catch (error) {
      console.error('Resim yüklemede bir hata oluştu', error);
      
      // Yetki hatası kontrolü
      if (error.message.includes('yetkiniz bulunmuyor')) {
        message.error('Resim yüklenemedi: Bu işlem için yetkiniz bulunmuyor!');
      } else if (error.message.includes('Oturum süreniz dolmuş')) {
        message.error('Resim yüklenemedi: Oturum süreniz dolmuş, lütfen tekrar giriş yapın!');
      } else {
        message.error(`Resim yüklenemedi: ${error.message}`);
      }
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




