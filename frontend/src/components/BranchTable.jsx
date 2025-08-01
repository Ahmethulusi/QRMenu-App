// components/BranchTable.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, message, Select, InputNumber } from 'antd'; // InputNumber ve Select eklendi
import { EditOutlined, DeleteOutlined, PlusOutlined, ShoppingOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

const businessId = 1; // Frontend'den gönderilecek sabit business ID
const API_URL = import.meta.env.VITE_API_URL;

const { Option } = Select; // Select bileşeni için Option

const BranchTable = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Add/Edit Branch Modal
  const [productsModalVisible, setProductsModalVisible] = useState(false); // Show Products Modal
  const [addProductToBranchModalVisible, setAddProductToBranchModalVisible] = useState(false); // NEW: Add Product to Branch Modal
  const [editingBranch, setEditingBranch] = useState(null);
  const [currentBranchProducts, setCurrentBranchProducts] = useState([]);
  const [selectedBranchName, setSelectedBranchName] = useState('');
  const [selectedBranchIdForProducts, setSelectedBranchIdForProducts] = useState(null); // NEW: Store branch ID for product operations
  const [availableProducts, setAvailableProducts] = useState([]); // NEW: To store all products for dropdown
  const [editingKey, setEditingKey] = useState(''); // Inline editing için
  const [editForm] = Form.useForm(); // Inline editing için form
  
  const [form] = Form.useForm(); // For Branch Add/Edit
  const [addProductForm] = Form.useForm(); // NEW: For Add Product to Branch

  useEffect(() => {
  if (addProductToBranchModalVisible) {
    console.log('Current form values:', addProductForm.getFieldsValue());
  }
}, [addProductToBranchModalVisible]);


  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/branches/${businessId}`);
      const data = await res.json();
      setBranches(data);
    } catch (err) {
      message.error('Şubeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

const fetchAvailableProducts = async () => {
    try {
      console.log('Fetching available products for branch...');
      // Yeni endpoint: şubeye henüz eklenmemiş ürünleri getir
      const res = await fetch(`${API_URL}/api/branches/${selectedBranchIdForProducts}/${businessId}/available-products`);
      const data = await res.json();
      console.log('Available products for branch:', data);
      setAvailableProducts(data);
    } catch (err) {
      console.error('Ürün yükleme hatası:', err);
      message.error('Ürünler yüklenemedi');
    }
  };
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/branches/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Silme işlemi başarısız');
      }
      message.success('Şube silindi');
      fetchBranches();
    } catch (error) {
      message.error(error.message || 'Silme işlemi başarısız');
    }
  };

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
      const url = editingBranch
        ? `${API_URL}/api/branches/${branchId}`
        : `${API_URL}/api/branches/`;
      const method = editingBranch ? 'PUT' : 'POST';
      const body = JSON.stringify({ ...values, businessId: businessId });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Kaydetme işlemi başarısız');
      }

      message.success(editingBranch ? 'Şube güncellendi' : 'Şube eklendi');
      setModalVisible(false);
      fetchBranches();
    } catch (error) {
      message.error(error.message || 'Kaydetme işlemi başarısız');
    }
  };

  const showBranchProducts = async (branchId, branchName) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/branches/${branchId}/products`);
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Şube ürünleri yüklenemedi');
      }
      const data = await res.json();
      setCurrentBranchProducts(data);
      setSelectedBranchName(branchName);
      setSelectedBranchIdForProducts(branchId); // Store for adding products
      setProductsModalVisible(true);
    } catch (err) {
      message.error(err.message || 'Şube ürünleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

const openAddProductToBranchModal = () => {
  addProductForm.resetFields(); // Formu temizle
  fetchAvailableProducts(); // Ürünleri yeniden yükle
  setAddProductToBranchModalVisible(true);
};

const handleSaveProductToBranch = async () => {
  try {
    // Form verilerini al
    const values = await addProductForm.validateFields();

    // Gönderilecek veri
    const payload = {
      branch_id: selectedBranchIdForProducts,
      product_ids: values.product_ids,
    };

    // API isteği yap
    const response = await fetch(`${API_URL}/api/branches/add-product-to-branch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Cevabı al ve işle
    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.error || 'Ürünler şubeye eklenemedi';
      message.error(errorMessage);
      return;
    }

    // Başarılı veya kısmen başarılı durumlar
    if (result.errors && result.errors.length > 0) {
      message.warning(`${result.added} ürün eklendi, ${result.failed} ürün eklenemedi`);
    } else {
      message.success(`${result.added} ürün başarıyla eklendi!`);
    }

    // Formu sıfırla ve modalı kapat
    addProductForm.resetFields();
    setAddProductToBranchModalVisible(false);

    // Şube ürünlerini güncelle
    showBranchProducts(selectedBranchIdForProducts, selectedBranchName);

  } catch (err) {
    console.error('Hata:', err);
    message.error(err.message || 'Ürün ekleme işlemi başarısız oldu');
  }
};


  useEffect(() => {
    fetchBranches();
  }, []);

  // Inline editing için EditableCell bileşeni
  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              { required: true, message: `${title} gerekli!` },
              { pattern: /^\d+(\.\d{1,2})?$/, message: 'Geçerli bir değer giriniz!' }
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  // Inline editing fonksiyonları
  const isEditing = (record) => record.product_id === editingKey;

  const edit = (record) => {
    editForm.setFieldsValue({
      price: record.price ?? 0,
      stock: record.stock ?? 0,
    });
    setEditingKey(record.product_id);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await editForm.validateFields();
      
      // Backend'e güncelleme isteği gönder
      const response = await fetch(`${API_URL}/api/branches/branch-products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: selectedBranchIdForProducts,
          product_id: key,
          price: row.price,
          stock: row.stock,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Güncelleme başarısız');
      }

      // Frontend'de güncelle
      const newData = [...currentBranchProducts];
      const index = newData.findIndex((item) => key === item.product_id);
      if (index > -1) {
        newData[index] = { ...newData[index], ...row };
        setCurrentBranchProducts(newData);
        setEditingKey('');
        message.success('Fiyat ve stok güncellendi!');
      }
    } catch (err) {
      message.error(err.message || 'Güncelleme hatası!');
    }
  };

  const handleProductDelete = async (product_id) => {
    try {
      const response = await fetch(`${API_URL}/api/branches/branch-products`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: selectedBranchIdForProducts,
          product_id,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Silme işlemi başarısız');
      }
  
      // Frontend'den sil
      setCurrentBranchProducts((prev) =>
        prev.filter((item) => item.product_id !== product_id)
      );
      message.success('Ürün başarıyla kaldırıldı!');
    } catch (err) {
      message.error(err.message || 'Silme hatası!');
    }
  };
  

  const productColumns = [
    {
      title: 'Ürün Adı',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Şubeye Özel Fiyat',
      dataIndex: 'price',
      key: 'price',
      editable: true,
      render: (text, record) => (isEditing(record) ? null : (text === null || text === undefined ? 0 : text))
    },
    {
      title: 'Şube Stoğu',
      dataIndex: 'stock',
      key: 'stock',
      editable: true,
      render: (text, record) => (isEditing(record) ? null : (text === null || text === undefined ? 0 : text))
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
              onClick={() => save(record.product_id)}
              type="link"
              icon={<SaveOutlined />}
              style={{ marginRight: 8 }}
            >
              Kaydet
            </Button>
            <Button
              onClick={cancel}
              type="link"
              icon={<CloseOutlined />}
            >
              İptal
            </Button>
          </span>
        ) : (
          <span>
            <Button
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
              type="link"
              icon={<EditOutlined />}
              style={{ marginRight: 8 }}
            >
              Düzenle
            </Button>
            <Button
              danger
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleProductDelete(record.product_id)}
            >
              Kaldır
            </Button>
          </span>
        );
      },
    },
    
  ];

  const columns = [
   
    {
      title: 'Şube Adı',
      dataIndex: 'name',
    },
    {
      title: 'Adres',
      dataIndex: 'adress',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => openModal(record)}
          >
            Düzenle
          </Button>
          <Popconfirm
            title="Silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger type="link">
              Sil
            </Button>
          </Popconfirm>
          <Button
            icon={<ShoppingOutlined />}
            type="link"
            onClick={() => showBranchProducts(record.id, record.name)}
          >
            Ürünleri Göster
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Şubeler</h2>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => openModal()}
        >
          Yeni Şube
        </Button>
      </div>

      <Table
        scroll={{x: 900, y: 400 }}  // Y scroll'u ekledik
        columns={columns}
        dataSource={branches}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

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

      {/* Products Modal */}
      <Modal
        open={productsModalVisible}
        title={`${selectedBranchName} Şubesine Ait Ürünler`}
        onCancel={() => setProductsModalVisible(false)}
        footer={[
            <Button key="close" onClick={() => setProductsModalVisible(false)}>
                Kapat
            </Button>,
            <Button key="add_product" type="primary" onClick={openAddProductToBranchModal}>
                <PlusOutlined /> Ürün Ekle
            </Button>
        ]}
        width={800}
      >
        <Form form={editForm} component={false}>
          <Table
            scroll={{x: 900, y: 400 }}  // Y scroll'u ekledik

            components={{
              body: {
                cell: EditableCell,
              },
            }}
            columns={productColumns.map(col => {
              if (!col.editable) {
                return col;
              }
              return {
                ...col,
                onCell: record => ({
                  record,
                  inputType: col.dataIndex === 'price' ? 'number' : 'number',
                  dataIndex: col.dataIndex,
                  title: col.title,
                  editing: isEditing(record),
                }),
              };
            })}
            dataSource={currentBranchProducts}
            rowKey="product_id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </Form>
      </Modal>

      {/* NEW: Add Product to Branch Modal */}
       {/* NEW: Add Product to Branch Modal - destroyOnClose eklendi */}
    {/* NEW: Add Product to Branch Modal */}
<Modal
  open={addProductToBranchModalVisible}
  title={`${selectedBranchName} Şubesine Ürün Ekle`}
  onCancel={() => {
    setAddProductToBranchModalVisible(false);
    addProductForm.resetFields(); // Formu temizle
  }}
  onOk={handleSaveProductToBranch}
  okText="Ekle"
  cancelText="İptal"
  destroyOnClose={true}
>
  <Form form={addProductForm} layout="vertical">
<Form.Item
  name="product_ids" // Artık array olarak alacağımız için ismi product_ids yapın
  label="Ürünler"
  rules={[{ required: true, message: 'Lütfen en az bir ürün seçin' }]}
>
  <Select
    mode="multiple" // Bu satır çoklu seçimi aktif eder
    showSearch
    placeholder="Ürünleri seçiniz"
    optionFilterProp="children"
    style={{ width: '100%' }}
    allowClear
  >
    {availableProducts.map(product => (
      <Option key={product.product_id} value={product.product_id}>
        {product.product_name}
      </Option>
    ))}
  </Select>
</Form.Item>
  </Form>
</Modal>
    </div>
  );
};

export default BranchTable;