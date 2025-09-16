import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';

const { Option } = Select;

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [form] = Form.useForm();
  const [urlForm] = Form.useForm();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Şubeleri getir
  const fetchBranches = async () => {
    try {
      // Business ID'yi localStorage'dan al (örnek olarak 1 kullanıyoruz)
      const businessId = 1; // Gerçek uygulamada bu değer dinamik olmalı
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/api/branches/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setBranches(data);
      
      // Eğer şube varsa, ilk şubeyi seç
      if (data.length > 0 && !selectedBranchId) {
        setSelectedBranchId(data[0].id);
      }
    } catch (error) {
      console.error('Şubeler getirilemedi:', error);
      message.error('Şubeler getirilemedi');
    }
  };

  // Bölümleri getir
  const fetchSections = async () => {
    if (!selectedBranchId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/api/orderable-qr/sections?branch_id=${selectedBranchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      // Veri kontrolü yap ve dizi değilse boş dizi kullan
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Bölümler getirilemedi:', error);
      message.error('Bölümler getirilemedi');
      setSections([]); // Hata durumunda boş dizi kullan
    } finally {
      setLoading(false);
    }
  };

  // Şube değiştiğinde bölümleri yeniden getir
  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchSections();
    }
  }, [selectedBranchId]);

  // Bölüm ekleme/güncelleme
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingSection) {
        // Güncelleme
        const response = await fetch(`${apiUrl}/api/orderable-qr/sections/${editingSection.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            section_name: values.section_name,
            branch_id: values.branch_id
          })
        });
        
        if (!response.ok) {
          throw new Error('Bölüm güncellenemedi');
        }
        
        message.success('Bölüm başarıyla güncellendi');
      } else {
        // Yeni ekleme
        const response = await fetch(`${apiUrl}/api/orderable-qr/sections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            section_name: values.section_name,
            branch_id: values.branch_id
          })
        });
        
        if (!response.ok) {
          throw new Error('Bölüm eklenemedi');
        }
        
        message.success('Bölüm başarıyla eklendi');
      }
      
      setModalVisible(false);
      setEditingSection(null);
      form.resetFields();
      fetchSections();
    } catch (error) {
      console.error('Bölüm kaydedilemedi:', error);
      message.error('Bölüm kaydedilemedi');
    }
  };

  // Bölüm silme
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/orderable-qr/sections/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Bölüm silinemedi');
      }
      
      message.success('Bölüm başarıyla silindi');
      fetchSections();
    } catch (error) {
      console.error('Bölüm silinemedi:', error);
      message.error('Bölüm silinemedi');
    }
  };

  // Düzenleme modalını aç
  const handleEdit = (section) => {
    setEditingSection(section);
    form.setFieldsValue({
      section_name: section.section_name,
      branch_id: section.branch_id // Form'da gösterilmeyecek ama güncelleme için gerekli
    });
    setModalVisible(true);
  };

  // Yeni bölüm ekleme modalını aç
  const handleAdd = () => {
    setEditingSection(null);
    form.setFieldsValue({
      section_name: '',
      branch_id: selectedBranchId // Form'da gösterilmeyecek ama backend'e gönderilecek
    });
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Bölüm Adı',
      dataIndex: 'section_name',
      key: 'section_name',
    },
    {
      title: 'Şube',
      dataIndex: 'Branch',
      key: 'branch',
      render: (branch) => branch?.name || '-',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Bu bölümü silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Base URL ayarla
  const handleSetBaseUrl = async () => {
    try {
      const values = await urlForm.validateFields();
      setBaseUrl(values.base_url);
      localStorage.setItem('qr_base_url', values.base_url);
      message.success('QR Base URL başarıyla kaydedildi');
      setUrlModalVisible(false);
    } catch (error) {
      console.error('Base URL kaydedilemedi:', error);
    }
  };

  // Component yüklendiğinde localStorage'dan base URL'i al
  useEffect(() => {
    const savedBaseUrl = localStorage.getItem('qr_base_url');
    if (savedBaseUrl) {
      setBaseUrl(savedBaseUrl);
      urlForm.setFieldsValue({ base_url: savedBaseUrl });
    }
  }, []);

  return (
    <div className="section-management">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="Şube Seçin"
            style={{ width: 200 }}
            value={selectedBranchId}
            onChange={setSelectedBranchId}
          >
            {branches.map(branch => (
              <Option key={branch.id} value={branch.id}>{branch.name}</Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            disabled={!selectedBranchId}
          >
            Yeni Bölüm Ekle
          </Button>
          <Tooltip title="QR kodları için base URL ayarla">
            <Button
              type="default"
              icon={<LinkOutlined />}
              onClick={() => setUrlModalVisible(true)}
            >
              QR Base URL Ayarla
            </Button>
          </Tooltip>
        </Space>
        {baseUrl && (
          <div style={{ marginTop: 8, color: '#1890ff' }}>
            Mevcut Base URL: {baseUrl}
          </div>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={sections}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingSection ? "Bölümü Düzenle" : "Yeni Bölüm Ekle"}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          setEditingSection(null);
          form.resetFields();
        }}
        okText={editingSection ? "Güncelle" : "Ekle"}
        cancelText="İptal"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="section_name"
            label="Bölüm Adı"
            rules={[{ required: true, message: 'Lütfen bölüm adı girin!' }]}
          >
            <Input placeholder="Bölüm adını girin" />
          </Form.Item>
          
          <Form.Item
            name="branch_id"
            hidden={true} // Gizli alan, otomatik olarak seçili şube ID'si kullanılacak
          >
            <Input type="hidden" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Base URL Ayarlama Modalı */}
      <Modal
        title="QR Base URL Ayarla"
        open={urlModalVisible}
        onOk={handleSetBaseUrl}
        onCancel={() => setUrlModalVisible(false)}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form
          form={urlForm}
          layout="vertical"
        >
          <Form.Item
            name="base_url"
            label="QR Kodları için Base URL"
            rules={[{ required: true, message: 'Lütfen bir URL girin!' }]}
            help="Tüm QR kodları için kullanılacak temel URL. Masa numarası otomatik olarak sonuna eklenecektir."
          >
            <Input placeholder="https://example.com/menu" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SectionManagement;
