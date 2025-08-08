import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Upload, message, InputNumber, Col, Row, Select, Radio } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CategorySelector from './CategorySelector';

const API_URL = import.meta.env.VITE_API_URL;

const EditModal = ({ visible, onCancel, onOk, record }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('true');
  const [showcase, setShowcase] = useState('false');
  const [loading, setLoading] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);

  // Record değiştiğinde form alanlarını doldur
  useEffect(() => {
    if (record) {
      console.log("Setting form values:", record); // Debug için
      form.setFieldsValue({
        name: record.product_name,
        description: record.description,
        price: record.price,
        category: record.category_id,
        stock: record.stock,
        status: record.is_available ? 'true' : 'false',
        showcase: record.is_selected ? 'true' : 'false'
      });
      setStatus(record.is_available ? 'true' : 'false');
      setShowcase(record.is_selected ? 'true' : 'false');
      setImageRemoved(false);
      
      // Eğer resim varsa göster
      if (record.image_url) {
        // URL'den ana sunucu kısmını kaldır çünkü zaten tam URL geliyor
        const imageUrl = record.image_url.replace(`${API_URL}`, '');
        setFile({ preview: `${API_URL}${imageUrl}` });
      } else {
        setFile(null);
      }
    }
  }, [record, form]);

  const handleRemove = () => {
    setFile(null);
    setImageRemoved(true);
  };

  const onCancel_handler = () => {
    form.resetFields();
    setFile(null);
    setImageRemoved(false);
    onCancel();
  };

  const handleUpload = ({ file }) => {
    setFile({
      file,
      preview: URL.createObjectURL(file)
    });
    setImageRemoved(false);
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (!values.category) {
        message.error('Lütfen bir kategori seçin!');
        return;
      }

      const token = localStorage.getItem('token');

      // Önce ürün bilgilerini güncelle
      const productResponse = await fetch(`${API_URL}/api/admin/products/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: record.product_id,
          newName: values.name,
          newPrice: values.price,
          newDescription: values.description,
          newCategory_id: parseInt(values.category),
          stock: values.stock,
          status: status === 'true',
          showcase: showcase === 'true'
        }),
      });

      if (!productResponse.ok) {
        throw new Error('Ürün güncellenirken bir hata oluştu');
      }

      // Sonra resim güncellemesi yap
      const formData = new FormData();
      formData.append('product_id', record.product_id);
      
      if (imageRemoved) {
        formData.append('removeImage', 'true');
      } else if (file && file.file) {
        formData.append('resim', file.file);
      }

      // Sadece resim değişikliği varsa resim güncelleme isteği gönder
      if (imageRemoved || (file && file.file)) {
        const imageResponse = await fetch(`${API_URL}/api/admin/products/updateImage`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (!imageResponse.ok) {
          throw new Error('Resim güncellenirken bir hata oluştu');
        }
      }

      message.success('Ürün başarıyla güncellendi!');
      onCancel();
      onOk();
    } catch (error) {
      console.error(error);
      message.error('Ürün güncellenemedi, lütfen tekrar deneyin!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Ürün Düzenle"
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel_handler}
      okText="Güncelle"
      cancelText="İptal"
      padding={0}
      width={600}
      style={{ height: 400, top: 25 }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="İsim"
          name="name"
          rules={[{ required: true, message: 'Lütfen isim giriniz!' }]}
        >
          <Input placeholder="İsim girin" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Açıklama"
              name="description"
            >
              <Input placeholder="Açıklama girin" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <CategorySelector />
          </Col>
        </Row>

        <Row gutter={20}>
          <Col span={12}>
            <Form.Item
              label="Fiyat"
              name="price"
              rules={[{ required: true, message: 'Lütfen fiyat giriniz!' }]}
            >
              <InputNumber placeholder="Fiyat girin" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Stok"
              name="stock"
            >
              <InputNumber placeholder="Stok girin" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={20}>
          <Col span={12}>
            <Form.Item label="Resim Yükle" name="upload" style={{ marginLeft: '5%' }}>
              {file ? (
                <>
                  <img 
                    src={file.preview} 
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                    alt="Product"
                  />
                  <Button type="primary" onClick={handleRemove} style={{ marginLeft: '5%', marginTop: '5%' }}>
                    Resimi Kaldır
                  </Button>
                </>
              ) : (
                <>
                  <Upload
                    accept="image/*"
                    beforeUpload={() => false}
                    onChange={info => handleUpload(info)}
                    showUploadList={false}
                  >
                    <Button style={{ width: '120px', height: '120px' }} icon={<PlusOutlined />}>
                      Resim Yükle
                    </Button>
                  </Upload>
                </>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  style={{ marginLeft: '20px' }}
                  label="Durum"
                  name="status"
                  rules={[{ required: true, message: 'Lütfen durum seçiniz!' }]}
                >
                  <Radio.Group onChange={(e) => setStatus(e.target.value)} value={status}>
                    <Radio value="true">Aktif</Radio>
                    <Radio value="false">Pasif</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  style={{ marginLeft: '20px' }}
                  label="Vitrin"
                  name="showcase"
                  rules={[{ required: true, message: 'Lütfen vitrin seçiniz!' }]}
                >
                  <Radio.Group onChange={(e) => setShowcase(e.target.value)} value={showcase}>
                    <Radio value="true">Evet</Radio>
                    <Radio value="false">Hayır</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditModal;
