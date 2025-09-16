import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Card, Row, Col, Divider, Typography, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const TableQRManagement = () => {
  const [tables, setTables] = useState([]);
  const [branches, setBranches] = useState([]);
  const [sections, setSections] = useState([]);
  const [qrCodes, setQRCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrModalVisible, setQRModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [form] = Form.useForm();
  const [qrForm] = Form.useForm();
  const [generatingQR, setGeneratingQR] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
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
    }
  };

  // Masaları getir
  const fetchTables = async () => {
    if (!selectedBranchId) return;
    
    setLoading(true);
    try {
      let url = `${apiUrl}/api/orderable-qr/tables?branch_id=${selectedBranchId}`;
      if (selectedSectionId) {
        url += `&section_id=${selectedSectionId}`;
      }
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      // Veri kontrolü yap ve dizi değilse boş dizi kullan
      setTables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Masalar getirilemedi:', error);
      message.error('Masalar getirilemedi');
      setTables([]); // Hata durumunda boş dizi kullan
    } finally {
      setLoading(false);
    }
  };

  // QR kodlarını getir
  const fetchQRCodes = async () => {
    if (!selectedBranchId) return;
    
    try {
      let url = `${apiUrl}/api/orderable-qr/qrcodes?branch_id=${selectedBranchId}&type=orderable`;
      const token = localStorage.getItem('token');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      // Veri kontrolü yap ve dizi değilse boş dizi kullan
      setQRCodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('QR kodları getirilemedi:', error);
      message.error('QR kodları getirilemedi');
      setQRCodes([]); // Hata durumunda boş dizi kullan
    }
  };

  // Şube değiştiğinde bölümleri ve masaları yeniden getir
  useEffect(() => {
    fetchBranches();
    
    // localStorage'dan base URL'i al
    const savedBaseUrl = localStorage.getItem('qr_base_url');
    if (savedBaseUrl) {
      setBaseUrl(savedBaseUrl);
    }
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchSections();
      fetchTables();
      fetchQRCodes();
    }
  }, [selectedBranchId]);

  // Bölüm değiştiğinde masaları yeniden getir
  useEffect(() => {
    if (selectedBranchId) {
      fetchTables();
    }
  }, [selectedSectionId]);

  // Masa ekleme/güncelleme
  const handleSaveTable = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTable) {
        // Güncelleme
        const response = await fetch(`${apiUrl}/api/orderable-qr/tables/${editingTable.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            table_name: values.table_name,
            branch_id: values.branch_id,
            section_id: values.section_id || null
          })
        });
        
        if (!response.ok) {
          throw new Error('Masa güncellenemedi');
        }
        
        message.success('Masa başarıyla güncellendi');
      } else {
        // Yeni ekleme
        const response = await fetch(`${apiUrl}/api/orderable-qr/tables`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            table_name: values.table_name,
            branch_id: values.branch_id,
            section_id: values.section_id || null
          })
        });
        
        if (!response.ok) {
          throw new Error('Masa eklenemedi');
        }
        
        message.success('Masa başarıyla eklendi');
      }
      
      setModalVisible(false);
      setEditingTable(null);
      form.resetFields();
      fetchTables();
    } catch (error) {
      console.error('Masa kaydedilemedi:', error);
      message.error('Masa kaydedilemedi');
    }
  };

  // Masa silme
  const handleDeleteTable = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/orderable-qr/tables/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Masa silinemedi');
      }
      
      message.success('Masa başarıyla silindi');
      fetchTables();
    } catch (error) {
      console.error('Masa silinemedi:', error);
      message.error('Masa silinemedi');
    }
  };

  // QR kodu oluştur
  const handleGenerateQR = async () => {
    try {
      setGeneratingQR(true);
      const values = await qrForm.validateFields();
      
      // Mevcut QR kontrolü
      const existingQR = qrCodes.find(qr => qr.table_id === selectedTable.id);
      if (existingQR) {
        message.warning('Bu masa için zaten bir QR kodu mevcut');
        setGeneratingQR(false);
        setQRModalVisible(false);
        return;
      }
      
      // QR URL'sini oluştur
      const baseUrl = values.base_url;
      const tableNo = selectedTable.table_no;
      const fullUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}table=${tableNo}`;
      
      // QR kodunu oluştur
      const response = await fetch(`${apiUrl}/api/orderable-qr/qrcodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          business_id: values.business_id,
          branch_id: selectedTable.branch_id,
          table_id: selectedTable.id,
          type: 'orderable',
          qr_url: fullUrl,
          color: values.color || '#000000',
          size: values.size || 256
        })
      });
      
      if (!response.ok) {
        throw new Error('QR kodu oluşturulamadı');
      }
      
      message.success('QR kodu başarıyla oluşturuldu');
      fetchQRCodes();
      setQRModalVisible(false);
      qrForm.resetFields();
    } catch (error) {
      console.error('QR kodu oluşturulamadı:', error);
      message.error('QR kodu oluşturulamadı');
    } finally {
      setGeneratingQR(false);
    }
  };

  // QR kodunu sil
  const handleDeleteQR = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/orderable-qr/qrcodes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('QR kodu silinemedi');
      }
      
      message.success('QR kodu başarıyla silindi');
      fetchQRCodes();
    } catch (error) {
      console.error('QR kodu silinemedi:', error);
      message.error('QR kodu silinemedi');
    }
  };

  // Düzenleme modalını aç
  const handleEditTable = (table) => {
    setEditingTable(table);
    form.setFieldsValue({
      table_name: table.table_name,
      branch_id: table.branch_id,
      section_id: table.section_id
    });
    setModalVisible(true);
  };

  // QR oluşturma modalını aç
  const handleOpenQRModal = (table) => {
    setSelectedTable(table);
    
    // İşletme ID'sini al (ilk şubenin business_id'si)
    const businessId = branches.find(b => b.id === table.branch_id)?.business_id;
    
    // Eğer base URL yoksa uyarı ver
    if (!baseUrl) {
      message.warning('QR Base URL ayarlanmamış. Lütfen önce Bölümler sayfasından Base URL ayarlayın.');
      return;
    }
    
    qrForm.setFieldsValue({
      business_id: businessId,
      base_url: baseUrl,
      color: '#000000',
      size: 256
    });
    
    setQRModalVisible(true);
  };

  // Yeni masa ekleme işlemi - artık modal açmıyoruz, direkt ekliyoruz
  const handleAddTable = async () => {
    if (!selectedBranchId) {
      message.error('Lütfen bir şube seçin');
      return;
    }
    
    try {
      const response = await fetch(`${apiUrl}/api/orderable-qr/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          branch_id: selectedBranchId,
          section_id: selectedSectionId || null
          // table_no belirtmiyoruz, backend otomatik atayacak
        })
      });
      
      if (!response.ok) {
        throw new Error('Masa eklenemedi');
      }
      
      message.success('Masa başarıyla eklendi');
      fetchTables(); // Masaları yeniden yükle
    } catch (error) {
      console.error('Masa eklenemedi:', error);
      message.error('Masa eklenemedi');
    }
  };

  // QR kodunu indir
  const handleDownloadQR = (qrCode) => {
    if (!qrCode.file_path) {
      message.error('QR kodu dosyası bulunamadı');
      return;
    }
    
    const downloadUrl = `${apiUrl}${qrCode.file_path}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `QR_${qrCode.Table?.table_no || 'table'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Masa numarasını güncelle
  const handleUpdateTableNo = async (id, table_no) => {
    try {
      const response = await fetch(`${apiUrl}/api/orderable-qr/tables/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ table_no })
      });
      
      if (!response.ok) {
        throw new Error('Masa numarası güncellenemedi');
      }
      
      message.success('Masa numarası güncellendi');
      fetchTables(); // Masaları yeniden yükle
    } catch (error) {
      console.error('Masa numarası güncellenemedi:', error);
      message.error('Masa numarası güncellenemedi');
    }
  };

  const tableColumns = [
  
    {
      title: 'Masa No',
      dataIndex: 'table_no',
      key: 'table_no',
      editable: true,
      render: (text, record) => {
        return (
          <Input
            defaultValue={text}
            onBlur={(e) => {
              const newValue = parseInt(e.target.value);
              if (isNaN(newValue) || newValue <= 0) {
                message.error('Geçerli bir masa numarası girin');
                e.target.value = text; // Değeri eski haline getir
                return;
              }
              
              if (newValue !== text) {
                handleUpdateTableNo(record.id, newValue);
              }
            }}
            style={{ width: '80px' }}
          />
        );
      }
    },
    {
      title: 'Şube',
      dataIndex: 'Branch',
      key: 'branch',
      render: (branch) => branch?.name || '-',
    },
    {
      title: 'Bölüm',
      dataIndex: 'Section',
      key: 'section',
      render: (section) => section?.section_name || '-',
    },
    {
      title: 'QR Durumu',
      key: 'qr_status',
      render: (_, record) => {
        const hasQR = qrCodes.some(qr => qr.table_id === record.id);
        return hasQR ? 
          <Text type="success">QR Mevcut</Text> : 
          <Text type="warning">QR Yok</Text>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const hasQR = qrCodes.some(qr => qr.table_id === record.id);
        const qrCode = qrCodes.find(qr => qr.table_id === record.id);
        
        return (
          <Space size="small">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEditTable(record)}
              size="small"
            />
            {!hasQR ? (
              <Button
                type="primary"
                icon={<QrcodeOutlined />}
                onClick={() => handleOpenQRModal(record)}
                size="small"
              />
            ) : (
              <Button
                type="default"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadQR(qrCode)}
                size="small"
              />
            )}
            <Popconfirm
              title="Bu masayı silmek istediğinize emin misiniz?"
              onConfirm={() => handleDeleteTable(record.id)}
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
        );
      },
    },
  ];

  const qrColumns = [
    {
      title: 'Masa',
      dataIndex: 'Table',
      key: 'table',
      render: (table) => table?.table_name || '-',
    },
    {
      title: 'Şube',
      dataIndex: 'Branch',
      key: 'branch',
      render: (branch) => branch?.name || '-',
    },
    {
      title: 'QR Görüntüsü',
      key: 'qr_image',
      render: (_, record) => (
        record.file_path ? 
          <img 
            src={`${apiUrl}${record.file_path}`} 
            alt="QR Kodu" 
            style={{ width: 80, height: 80 }} 
          /> : 
          '-'
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => isActive ? 
        <Text type="success">Aktif</Text> : 
        <Text type="danger">Pasif</Text>,
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadQR(record)}
            size="small"
          />
          <Popconfirm
            title="Bu QR kodunu silmek istediğinize emin misiniz?"
            onConfirm={() => handleDeleteQR(record.id)}
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
    <div className="table-qr-management">
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Şube Seçin"
              style={{ width: '100%' }}
              value={selectedBranchId}
              onChange={setSelectedBranchId}
            >
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>{branch.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Bölüm Seçin (Opsiyonel)"
              style={{ width: '100%' }}
              value={selectedSectionId}
              onChange={setSelectedSectionId}
              allowClear
            >
              {sections.map(section => (
                <Option key={section.id} value={section.id}>{section.section_name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddTable}
              disabled={!selectedBranchId}
            >
              Yeni Masa Ekle
            </Button>
          </Col>
        </Row>
      </div>

      <Table
        columns={tableColumns}
        dataSource={tables}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Masa düzenleme modalını kaldırdık, artık inline editing kullanıyoruz */}

      {/* QR Kodu Oluşturma Modalı */}
      <Modal
        title="QR Kodu Oluştur"
        open={qrModalVisible}
        onOk={handleGenerateQR}
        onCancel={() => {
          setQRModalVisible(false);
          setSelectedTable(null);
          qrForm.resetFields();
        }}
        okText="QR Kodu Oluştur"
        cancelText="İptal"
        confirmLoading={generatingQR}
      >
        {selectedTable && (
          <div style={{ marginBottom: 16 }}>
            <Card size="small">
              <Text strong>Masa: </Text>
              <Text>{selectedTable.table_name}</Text>
              <br />
              <Text strong>Şube: </Text>
              <Text>{branches.find(b => b.id === selectedTable.branch_id)?.name || '-'}</Text>
              <br />
              <Text strong>Bölüm: </Text>
              <Text>{sections.find(s => s.id === selectedTable.section_id)?.section_name || '-'}</Text>
            </Card>
          </div>
        )}
        
        <Form
          form={qrForm}
          layout="vertical"
        >
          <Form.Item
            name="business_id"
            label="İşletme ID"
            rules={[{ required: true, message: 'İşletme ID gerekli!' }]}
            hidden
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="base_url"
            label="QR URL Başlangıcı"
            rules={[{ required: true, message: 'Lütfen URL girin!' }]}
            help="Masa numarası otomatik olarak URL'nin sonuna eklenecektir."
          >
            <Input placeholder="https://example.com/menu" disabled />
          </Form.Item>
          
          <Form.Item
            name="color"
            label="QR Rengi"
          >
            <Input type="color" style={{ width: 100 }} />
          </Form.Item>
          
          <Form.Item
            name="size"
            label="QR Boyutu (piksel)"
            initialValue={256}
          >
            <Input type="number" min={128} max={1024} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TableQRManagement;
