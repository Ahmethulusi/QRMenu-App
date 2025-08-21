import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Form, message } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import "../../../css/pricechange.css";

const API_URL = import.meta.env.VITE_API_URL;
const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  save,  // Kaydetme işlevini prop olarak alıyoruz
  children,
  ...restProps
}) => {
  const inputNode = (
    <Input
      onKeyDown={(e) => handleKeyDown(e, record.key)}  // Enter tuşu kontrolü
    />
  );

  // Enter tuşuna basıldığında kaydet fonksiyonunu çağıran fonksiyon
  const handleKeyDown = (e, key) => {
    if (e.key === 'Enter') {
      save(key);  // Enter tuşuna basıldığında kaydet
    }
  };

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Lütfen ${title} giriniz!`,
            },
            {
              pattern: /^\d+(\.\d{1,2})?$/,
              message: 'Geçerli bir fiyat giriniz!',
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};


const ProductPriceTable = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [filteredNames, setFilteredNames] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [percentageChange, setPercentageChange] = useState(''); // Yüzdelik değişim
  const [modifiedData, setModifiedData] = useState([]); // Toplu fiyat güncelleme için
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Seçili satırların key'leri için state
  const [loading, setLoading] = useState(false); // Loading state ekleyelim
  const [userPermissions, setUserPermissions] = useState(null); // Kullanıcı yetkileri
  const [permissionsLoading, setPermissionsLoading] = useState(true); // Yetki yükleme durumu

  useEffect(() => {
    fetchProducts();
    fetchUserPermissions();
  }, []);

  // Kullanıcı yetkilerini getir
  const fetchUserPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPermissionsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/permissions/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.permissions);
        console.log('✅ Kullanıcı yetkileri yüklendi:', data.permissions);
      }
    } catch (error) {
      console.error('❌ Yetkiler yüklenirken hata:', error);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // Yetki kontrol fonksiyonları
  const hasPermission = (resource, action) => {
    if (!userPermissions) return false;
    return userPermissions.some(perm => perm.resource === resource && perm.action === action);
  };

  // Ürünleri API'den çekme
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Ürünler getiriliyor...');
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Token bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      console.log('✅ Token bulundu, API çağrısı yapılıyor...');
      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          message.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else if (response.status === 403) {
          message.error('Bu işlem için yetkiniz bulunmuyor.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        return;
      }

      const products = await response.json();
      console.log('✅ API yanıtı:', products);

      if (!products || !Array.isArray(products)) {
        throw new Error('API geçersiz veri döndürdü');
      }

      // Veriyi Ant Design Tablosuna uygun hale getirme
      const formattedData = products.map((product) => ({
        key: product.product_id,
        id: product.product_id,
        name: product.product_name,
        category: product.category ? product.category.category_name : 'Kategori Yok',
        currentPrice: product.price,
        newPrice: '',
      }));

      console.log('📦 Formatlanmış veri:', formattedData);

      // Filtreleri ayarlama
      const uniqueNames = [...new Set(formattedData.map((item) => item.name))];
      const nameFilters = uniqueNames.map((name) => ({ text: name, value: name }));
      setFilteredNames(nameFilters);

      const uniqueCategories = [
        ...new Set(formattedData.map((item) => item.category)),
      ];
      const categoryFilters = uniqueCategories.map((category) => ({
        text: category,
        value: category,
      }));
      setFilteredCategories(categoryFilters);

      setData(formattedData);
      console.log(`✅ ${formattedData.length} ürün başarıyla yüklendi`);
    } catch (error) {
      console.error('❌ Fetch Hatası:', error);
      message.error(`Ürünler alınırken bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      newPrice: record.newPrice || '',
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData[index] = { ...item, ...row };
        setData(newData);
        setEditingKey('');

        // Backend'e güncellenen fiyatı gönderme
        await updateProductPrice(item.id, row.newPrice);
        message.success('Fiyat başarıyla güncellendi!');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      message.error('Fiyat güncellenirken bir hata oluştu!');
    }
  };

  const updateProductPrice = async (productId, newPrice) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Token bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch(`${API_URL}/api/admin/products/updatePrice`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ price: parseFloat(newPrice), product_id: productId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          message.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else if (response.status === 403) {
          message.error('Bu işlem için yetkiniz bulunmuyor.');
        } else {
          throw new Error('Fiyat güncellenemedi!');
        }
        return;
      }
    } catch (error) {
      message.error('Fiyat güncellenirken bir hata oluştu!');
    }
  };

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const applyPriceChange = () => {
    const percentage = parseFloat(percentageChange);
    if (isNaN(percentage)) {
      message.error('Lütfen geçerli bir yüzdelik değer girin!');
      return;
    }

    if (selectedRowKeys.length === 0) {
      message.error('Lütfen en az bir ürün seçin!');
      return;
    }

    // Helper function to round to the nearest multiple of 5
    const roundToNearestFive = (price) => {
      return Math.round(price / 5) * 5;
    };

    const updatedData = data.map((item) => {
      if (selectedRowKeys.includes(item.key)) {
        const newPrice = item.currentPrice * (1 + percentage / 100);
        const roundedPrice = roundToNearestFive(newPrice).toFixed(2);
        return { ...item, newPrice: roundedPrice };
      }
      return item;
    });

    setData(updatedData);
    setModifiedData(updatedData.filter((item) => item.newPrice !== ''));
    message.success(`${selectedRowKeys.length} ürün için fiyat değişikliği hesaplandı`);
  };

  const cancelBulkPriceChange = () => {
    const resetData = data.map((item) => ({
      ...item,
      newPrice: '',
    }));
    setPercentageChange('');
    setData(resetData);
    setSelectedRowKeys([]); // Seçimleri sıfırla
  };

  const saveAll = async () => {
    try {
      // Sadece seçili ve yeni fiyatı olan ürünleri güncelle
      const selectedItems = data.filter(item => 
        selectedRowKeys.includes(item.key) && item.newPrice !== ''
      );

      if (selectedItems.length === 0) {
        message.error('Güncellenecek fiyat bulunamadı!');
        return;
      }

      await Promise.all(
        selectedItems.map((item) =>
          updateProductPrice(item.id, item.newPrice)
        )
      );

      // Başarılı kaydetme sonrası:
      // 1. Yeni fiyatları mevcut fiyat olarak güncelle
      // 2. Yeni fiyat alanlarını temizle
      const updatedData = data.map((item) => {
        if (selectedRowKeys.includes(item.key) && item.newPrice !== '') {
          return {
            ...item,
            currentPrice: parseFloat(item.newPrice), // Yeni fiyatı mevcut fiyat yap
            newPrice: '' // Yeni fiyat alanını temizle
          };
        }
        return item;
      });

      setData(updatedData);
      setPercentageChange('');
      setSelectedRowKeys([]); // Seçimleri sıfırla
      message.success('Tüm fiyatlar başarıyla güncellendi!');
    } catch (error) {
      message.error('Toplu güncelleme sırasında bir hata oluştu!');
    }
  };

  const columns = [
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      filters: filteredCategories,
      filterSearch: true,
      onFilter: (value, record) => record.category.includes(value),
      width: '20%',
    },
    {
      title: 'Ürün İsmi',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      filters: filteredNames,
      filterSearch: true,
      onFilter: (value, record) => record.name.includes(value),
    },
    {
      title: 'Şu Anki Fiyat',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      sorter: (a, b) => a.currentPrice - b.currentPrice,
      render: (text) => `${parseFloat(text).toFixed(2)} TL`,
      width: '15%',
    },
    {
      title: 'Yeni Fiyat',
      dataIndex: 'newPrice',
      key: 'newPrice',
      editable: true,
      render: (text) => (text ? `${parseFloat(text).toFixed(2)} TL` : ''),
      width: '15%',
    },
    {
      title: 'İşlem',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        
        // Yetki kontrolü
        if (!hasPermission('products', 'update')) {
          return <span style={{ color: '#999' }}>Düzenleme yetkisi yok</span>;
        }
        
        return editable ? (
          <span>
            <Button
              onClick={() => save(record.key)}
              type="link"
              icon={<SaveOutlined />}
              style={{ marginRight: 8 }}
            >
              Kaydet
            </Button>
            <Button onClick={cancel} type="link" icon={<CloseOutlined />}>
              İptal
            </Button>
          </span>
        ) : (
          <Button
            disabled={editingKey !== '' && editingKey !== record.key}
            onClick={() => edit(record)}
            type="link"
            icon={<EditOutlined />}
          >
            Düzenle
          </Button>
        );
      },
      width: '20%',
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
  
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'number',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        save,  // save fonksiyonunu EditableCell'e gönderiyoruz
      }),
    };
  });
  
  // Yetkiler yüklenene kadar hiçbir şey gösterme
  if (permissionsLoading) {
    return <div>Yetki kontrolleri yapılıyor...</div>;
  }

  return (
    <div>
      <Form form={form} component={false}>
        {hasPermission('products', 'update') ? (
          <>
            <Input
              placeholder="Yüzdelik Fiyat Değişikliği (%)"
              value={percentageChange}
              onChange={(e) => setPercentageChange(e.target.value)}
              style={{ width: '20%', marginRight: '8px' }}
            />
            <Button 
              type="primary" 
              onClick={applyPriceChange}
              disabled={selectedRowKeys.length === 0}
            >
              Uygula ({selectedRowKeys.length} ürün seçili)
            </Button>
            <Button
              type="primary"
              onClick={saveAll}
              style={{ marginLeft: '10px', backgroundColor: 'green', color: 'white' }}
              disabled={selectedRowKeys.length === 0}
            >
              Kaydet
            </Button>
            <Button
              type="primary"
              onClick={cancelBulkPriceChange}
              style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}
            >
              Vazgeç
            </Button>
          </>
        ) : (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#ff4d4f' }}>⚠️ Yetki Uyarısı</h3>
            <p>Bu sayfada fiyat değişikliği yapmak için yetkiniz bulunmuyor.</p>
            <p>Sadece ürünleri görüntüleyebilirsiniz.</p>
          </div>
        )}

        <Table
          loading={loading}
          rowSelection={hasPermission('products', 'update') ? rowSelection : undefined}
          scroll={{ x: 900, y: 350 }}  
          style={{marginTop: '20px',height: '400px'}}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            className: 'custom-pagination',
            pageSizeOptions: ['5', '10', '20', '50'],
            showSizeChanger: true,
            defaultPageSize: 5,
            responsive: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            position: ['bottomRight']
          }}
        />
      </Form>
    </div>
  );
};

export default ProductPriceTable;
