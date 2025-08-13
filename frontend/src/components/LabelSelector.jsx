import React, { useState, useEffect } from 'react';
import { Select, Tag, message, Button, Modal, Form, Input, ColorPicker } from 'antd';
import { PlusOutlined, TagOutlined } from '@ant-design/icons';
import { labelAPI } from '../utils/api';

const { Option } = Select;

const LabelSelector = ({ 
  value = [], 
  onChange, 
  placeholder = "Etiket seçiniz...",
  disabled = false,
  mode = "multiple",
  allowClear = true,
  showCreateNew = true
}) => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const labelsData = await labelAPI.getAllLabels();
      setLabels(labelsData || []);
      console.log('✅ Etiketler yüklendi:', labelsData);
    } catch (error) {
      console.error('❌ Etiket yükleme hatası:', error);
      message.error('Etiketler yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabel = async (values) => {
    try {
      setCreating(true);
      
      // ColorPicker obje döndürüyor, hex string'e çevir
      let colorValue = '#007bff'; // varsayılan
      if (values.color) {
        if (typeof values.color === 'string') {
          colorValue = values.color;
        } else if (values.color.toHexString) {
          colorValue = values.color.toHexString();
        } else if (values.color.hex) {
          colorValue = values.color.hex;
        }
      }
      
      const newLabel = await labelAPI.createLabel({
        name: values.name.trim(),
        description: values.description?.trim(),
        color: colorValue
      });
      
      // Etiket listesini güncelle
      setLabels(prev => [...prev, newLabel]);
      
      // Yeni etiketi seçili hale getir
      const newValue = Array.isArray(value) ? [...value, newLabel.label_id] : [newLabel.label_id];
      onChange?.(newValue);
      
      message.success('Etiket başarıyla oluşturuldu!');
      setIsCreateModalVisible(false);
      createForm.resetFields();
    } catch (error) {
      console.error('❌ Etiket oluşturma hatası:', error);
      message.error('Etiket oluşturulamadı: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleCancel = () => {
    setIsCreateModalVisible(false);
    createForm.resetFields();
  };

  // Etiket render fonksiyonu
  const tagRender = (props) => {
    const { label, value: tagValue, closable, onClose } = props;
    const labelData = labels.find(l => l.label_id === tagValue);
    
    return (
      <Tag
        color={labelData?.color || '#007bff'}
        closable={closable}
        onClose={onClose}
        style={{ 
          marginRight: 3,
          marginBottom: 2,
          borderRadius: '4px',
          fontWeight: '500'
        }}
        icon={<TagOutlined />}
      >
        {label}
      </Tag>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <Select
          mode={mode}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          loading={loading}
          allowClear={allowClear}
          tagRender={tagRender}
          style={{ flex: 1 }}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          maxTagCount="responsive"
        >
          {labels.map(label => (
            <Option key={label.label_id} value={label.label_id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: label.color || '#007bff',
                    border: '1px solid #d9d9d9'
                  }}
                />
                <span>{label.name}</span>
                {label.description && (
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    ({label.description})
                  </span>
                )}
              </div>
            </Option>
          ))}
        </Select>
        
        {showCreateNew && (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
            disabled={disabled}
            title="Yeni etiket oluştur"
            style={{ flexShrink: 0 }}
          >
            Yeni
          </Button>
        )}
      </div>

      {/* Yeni Etiket Oluşturma Modal */}
      <Modal
        title="Yeni Etiket Oluştur"
        open={isCreateModalVisible}
        onOk={createForm.submit}
        onCancel={handleCancel}
        confirmLoading={creating}
        okText="Oluştur"
        cancelText="İptal"
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateLabel}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="Etiket Adı"
            name="name"
            rules={[
              { required: true, message: 'Etiket adı zorunludur!' },
              { max: 100, message: 'Etiket adı en fazla 100 karakter olabilir!' },
              { whitespace: true, message: 'Etiket adı boş olamaz!' }
            ]}
          >
            <Input 
              placeholder="Örn: Vejetaryen, Glutensiz, Vegan..."
              maxLength={100}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Açıklama (Opsiyonel)"
            name="description"
            rules={[
              { max: 255, message: 'Açıklama en fazla 255 karakter olabilir!' }
            ]}
          >
            <Input.TextArea 
              placeholder="Etiket hakkında kısa açıklama..."
              maxLength={255}
              showCount
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Renk"
            name="color"
            initialValue="#007bff"
          >
            <ColorPicker 
              showText 
              format="hex"
              presets={[
                {
                  label: 'Önerilen Renkler',
                  colors: [
                    '#007bff', // Mavi
                    '#28a745', // Yeşil
                    '#dc3545', // Kırmızı
                    '#ffc107', // Sarı
                    '#6f42c1', // Mor
                    '#fd7e14', // Turuncu
                    '#20c997', // Teal
                    '#e83e8c', // Pembe
                  ],
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LabelSelector;
