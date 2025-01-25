import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Form, message } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Ürünleri API'den çekme
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/products');
      if (!response.ok) {
        throw new Error('Ürünler alınamadı!');
      }
      const products = await response.json();

      // Veriyi Ant Design Tablosuna uygun hale getirme
      const formattedData = products.map((product) => ({
        key: product.product_id,
        id: product.product_id,
        name: product.product_name,
        category: product.Category.category_name,
        currentPrice: product.price,
        newPrice: '',
      }));

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
    } catch (error) {
      console.error('Fetch Hatası:', error);
      message.error('Ürünler alınırken bir hata oluştu!');
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
      const response = await fetch(`http://localhost:5000/api/admin/products/updatePrice`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price: parseFloat(newPrice), product_id: productId }),
      });

      if (!response.ok) {
        throw new Error('Fiyat güncellenemedi!');
      }
    } catch (error) {
      message.error('Fiyat güncellenirken bir hata oluştu!');
    }
  };

  const cancelBulkPriceChange = () => {
    const resetData = data.map((item) => ({
      ...item,
      newPrice: '',  // Yeni fiyatları boşalt
    }));
    setPercentageChange('');
    setData(resetData);  // Veriyi güncelle
  };
  

  const applyPriceChange = () => {
    const percentage = parseFloat(percentageChange);
    if (isNaN(percentage)) {
        message.error('Lütfen geçerli bir yüzdelik değer girin!');
        return;
    }

    // Helper function to round to the nearest multiple of 5
    const roundToNearestFive = (price) => {
        return Math.round(price / 5) * 5;
    };

    const updatedData = data.map((item) => {
        if (filteredCategories.some((filter) => filter.value === item.category)) {
            const newPrice = (item.currentPrice * (1 + percentage / 100));
            const roundedPrice = roundToNearestFive(newPrice).toFixed(2); // Round and format to 2 decimal places
            return { ...item, newPrice: roundedPrice };
        }
        return item;
    });

    setData(updatedData);
    setModifiedData(updatedData.filter((item) => item.newPrice !== ''));
};
  const saveAll = async () => {
    try {
      await Promise.all(
        modifiedData.map((item) =>
          updateProductPrice(item.id, item.newPrice)
        )
      );
      setPercentageChange('');

      message.success('Tüm fiyatlar başarıyla güncellendi!');
      fetchProducts(); // Verileri yeniden çekme
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
      render: (text) => `$${parseFloat(text).toFixed(2)}`,
      width: '15%',
    },
    {
      title: 'Yeni Fiyat',
      dataIndex: 'newPrice',
      key: 'newPrice',
      editable: true,
      render: (text) => (text ? `$${parseFloat(text).toFixed(2)}` : ''),
      width: '15%',
    },
    {
      title: 'İşlem',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
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
            disabled={editingKey !== ''}
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
  
  return (
    <div>
      <Form form={form} component={false}>
        <Input
          placeholder="Yüzdelik Fiyat Değişikliği (%)"
          value={percentageChange}
          onChange={(e) => setPercentageChange(e.target.value)}
          style={{ width: '20%', marginRight: '8px' }}
        />
        <Button type="primary" onClick={applyPriceChange}>
          Uygula
        </Button>
        <Button
          type="primary"
          onClick={saveAll}
          style={{ marginLeft: '10px', backgroundColor: 'green' }}
        >
          Kaydet
        </Button>
        <Button onClick={cancelBulkPriceChange} type="default" style={{ marginLeft: 8 , backgroundColor: 'red',color: 'white'}}>
          Vazgeç
        </Button>

        <Table
          
          scroll={{ x: 410 }}  
          style={{marginTop: '20px'}}
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
            onChange: cancel,
          }}
        />
      </Form>
    </div>
  );
};

export default ProductPriceTable;
