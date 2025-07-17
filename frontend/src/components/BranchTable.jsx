// components/BranchTable.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Popconfirm, message, Select, InputNumber } from 'antd'; // InputNumber ve Select eklendi
import { EditOutlined, DeleteOutlined, PlusOutlined, ShoppingOutlined } from '@ant-design/icons';

const businessId = 8; // Frontend'den gönderilecek sabit business ID
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
      console.log('Fetching available products...');
      // API_URL/api/products veya API_URL/api/admin/productsByBusiness/${businessId}
      // Hangi endpoint'i kullandığınızdan emin olun.
      const res = await fetch(`${API_URL}/api/admin/productsByBusiness/${businessId}`);
      const data = await res.json();
      console.log('Available products:', data);
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
      const body = JSON.stringify({ ...values, business_id: businessId });

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

  const productColumns = [
    {
      title: 'Ürün ID',
      dataIndex: 'product_id',
      key: 'product_id',
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Şubeye Özel Fiyat',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Şube Stoğu',
      dataIndex: 'stock',
      key: 'stock',
    },
    // NEW: Opsiyonel: Ürünleri şubeden silme aksiyonu
    // {
    //   title: 'Aksiyonlar',
    //   key: 'product_actions',
    //   render: (_, record) => (
    //     <Popconfirm
    //       title="Bu ürünü şubeden kaldırmak istediğinize emin misiniz?"
    //       onConfirm={() => handleDeleteBranchProduct(selectedBranchIdForProducts, record.product_id)}
    //     >
    //       <Button icon={<DeleteOutlined />} danger type="link" size="small">
    //         Kaldır
    //       </Button>
    //     </Popconfirm>
    //   ),
    // },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
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
        <Table
          columns={productColumns}
          dataSource={currentBranchProducts}
          rowKey="product_id" // branch_id ve product_id birlikte primary key olduğu için bu satır önemli
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
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