import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tooltip, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';

const { Option } = Select;

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [form] = Form.useForm();
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

  // Toplu masa ekleme
  const [bulkAddModalVisible, setBulkAddModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [tableCount, setTableCount] = useState(1);
  
  // Toplu masa ekleme modalını aç
  const handleBulkAddModal = (section) => {
    setSelectedSection(section);
    setTableCount(1);
    setBulkAddModalVisible(true);
  };
  
  // Toplu masa ekleme işlemi
  const handleBulkAddTables = async () => {
    if (!selectedSection || tableCount < 1) {
      message.error('Lütfen geçerli bir masa sayısı girin');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const promises = [];
      
      // Belirtilen sayıda masa ekleme isteği oluştur
      for (let i = 0; i < tableCount; i++) {
        promises.push(
          fetch(`${apiUrl}/api/orderable-qr/tables`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              branch_id: selectedSection.branch_id,
              section_id: selectedSection.id
            })
          })
        );
      }
      
      // Tüm istekleri paralel olarak çalıştır
      const results = await Promise.allSettled(promises);
      
      // Başarılı ve başarısız istekleri say
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      if (successful > 0) {
        message.success(`${successful} masa başarıyla eklendi`);
      }
      
      if (failed > 0) {
        message.error(`${failed} masa eklenirken hata oluştu`);
      }
      
      setBulkAddModalVisible(false);
    } catch (error) {
      console.error('Toplu masa ekleme hatası:', error);
      message.error('Toplu masa ekleme işlemi başarısız oldu');
    }
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            type="default"
            onClick={() => handleBulkAddModal(record)}
            size="small"
            title="Toplu Masa Ekle"
          >
            Masa Ekle
          </Button>
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
        </Space>
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

      {/* Toplu Masa Ekleme Modalı */}
      <Modal
        title="Toplu Masa Ekle"
        open={bulkAddModalVisible}
        onOk={handleBulkAddTables}
        onCancel={() => setBulkAddModalVisible(false)}
        okText="Ekle"
        cancelText="İptal"
      >
        {selectedSection && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>Bölüm:</strong> {selectedSection.section_name}</p>
            <p><strong>Şube:</strong> {selectedSection.Branch?.name || '-'}</p>
          </div>
        )}
        <Form layout="vertical">
          <Form.Item 
            label="Eklenecek Masa Sayısı" 
            required
            help="Otomatik olarak sıralı numaralar atanacaktır."
          >
            <InputNumber 
              min={1} 
              max={100}
              value={tableCount}
              onChange={setTableCount}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SectionManagement;
