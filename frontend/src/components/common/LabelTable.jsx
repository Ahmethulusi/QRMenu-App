import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Modal, 
  Form, 
  Input, 
  Switch,
  Tag,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TagOutlined 
} from '@ant-design/icons';
// import { ChromePicker } from 'react-color';
import { labelAPI } from '../utils/api';
import { usePermissions } from '../hooks/usePermissions';

const LabelTable = () => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [form] = Form.useForm();
  const [selectedColor, setSelectedColor] = useState('#1890ff');
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const { hasPermission } = usePermissions();

  // Etiketleri yükle
  const fetchLabels = async () => {
    setLoading(true);
    try {
      const response = await labelAPI.getAllLabels();
      // Backend direkt array döndürüyor, data property'si yok
      setLabels(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Etiketler yüklenirken hata:', error);
      message.error('Etiketler yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  // Modal açma
  const openModal = (label = null) => {
    setEditingLabel(label);
    setModalVisible(true);
    
    if (label) {
      form.setFieldsValue({
        name: label.name,
        description: label.description,
        is_active: label.is_active
      });
      setSelectedColor(label.color || '#1890ff');
    } else {
      form.resetFields();
      setSelectedColor('#1890ff');
    }
  };

  // Modal kapatma
  const closeModal = () => {
    setModalVisible(false);
    setEditingLabel(null);
    form.resetFields();
    setSelectedColor('#1890ff');
    setColorPickerVisible(false);
  };

  // Etiket kaydetme
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const labelData = {
        ...values,
        color: selectedColor,
        is_active: values.is_active !== undefined ? values.is_active : true
      };

      if (editingLabel) {
        // Güncelleme
        await labelAPI.updateLabel(editingLabel.label_id, labelData);
        message.success('Etiket başarıyla güncellendi!');
      } else {
        // Yeni oluşturma
        await labelAPI.createLabel(labelData);
        message.success('Etiket başarıyla oluşturuldu!');
      }

      closeModal();
      fetchLabels();
    } catch (error) {
      console.error('Etiket kaydetme hatası:', error);
      message.error('Etiket kaydedilirken hata oluştu!');
    }
  };

  // Etiket silme
  const handleDelete = async (labelId) => {
    try {
      await labelAPI.deleteLabel(labelId);
      message.success('Etiket başarıyla silindi!');
      fetchLabels();
    } catch (error) {
      console.error('Etiket silme hatası:', error);
      message.error('Etiket silinirken hata oluştu!');
    }
  };

  // Tablo sütunları
  const columns = [
    {
      title: 'Etiket',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Tag color={record.color} style={{ fontSize: '14px', padding: '4px 8px' }}>
          <TagOutlined style={{ marginRight: '4px' }} />
          {text}
        </Tag>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Renk',
      dataIndex: 'color',
      key: 'color',
      width: '80px',
      render: (color) => (
        <div 
          style={{
            width: '30px',
            height: '20px',
            backgroundColor: color,
            border: '1px solid #d9d9d9',
            borderRadius: '4px'
          }}
        />
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'is_active',
      key: 'is_active',
      width: '100px',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '120px',
      render: (date) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: '120px',
      render: (_, record) => (
        <Space size="small">
          {hasPermission('labels', 'update') && (
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          )}
          {hasPermission('labels', 'delete') && (
            <Popconfirm
              title="Bu etiketi silmek istediğinizden emin misiniz?"
              onConfirm={() => handleDelete(record.label_id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <h2 style={{ margin: 0 }}>
            <TagOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Etiket Yönetimi
          </h2>
        </Col>
        <Col>
          {hasPermission('labels', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              Yeni Etiket
            </Button>
          )}
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={labels}
        rowKey="label_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Toplam ${total} etiket`,
        }}
        scroll={{ x: 800 }}
      />

      {/* Etiket Oluşturma/Düzenleme Modal */}
      <Modal
        title={editingLabel ? 'Etiket Düzenle' : 'Yeni Etiket Oluştur'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={closeModal}
        okText={editingLabel ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Etiket Adı"
            name="name"
            rules={[
              { required: true, message: 'Lütfen etiket adını girin!' },
              { max: 50, message: 'Etiket adı en fazla 50 karakter olabilir!' }
            ]}
          >
            <Input placeholder="Örn: Vejetaryen, Glutensiz, Acılı..." />
          </Form.Item>

          <Form.Item
            label="Açıklama"
            name="description"
            rules={[
              { max: 200, message: 'Açıklama en fazla 200 karakter olabilir!' }
            ]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Etiket hakkında açıklama..." 
            />
          </Form.Item>

          <Form.Item label="Renk">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: selectedColor,
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setColorPickerVisible(!colorPickerVisible)}
              />
              <span style={{ color: '#666' }}>
                {selectedColor.toUpperCase()}
              </span>
            </div>
            
            {colorPickerVisible && (
              <div style={{ marginTop: '10px' }}>
                <input 
                  type="color" 
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item
            label="Durum"
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch 
              checkedChildren="Aktif" 
              unCheckedChildren="Pasif" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LabelTable;
