import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, message, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL;

const EditCategoryModal = ({ visible, onCancel, onOk, category }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
      });
      setImageRemoved(false);
      
      // Eğer resim varsa göster
      if (category.imageUrl) {
        setFile({ preview: `${API_URL}/images/${category.imageUrl}` });
      } else {
        setFile(null);
      }
    }
  }, [category, form]);

  const handleRemove = () => {
    setFile(null);
    setImageRemoved(true);
  };

  const handleUpload = ({ file }) => {
    setFile({
      file,
      preview: URL.createObjectURL(file)
    });
    setImageRemoved(false);
  };

  const handleOkClick = async () => {
    try {
      setLoading(true);
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        window.location.href = '/login';
        return;
      }
      
      const values = await form.validateFields();

      if (!values.name) {
        message.error('Kategori ismi boş olamaz!');
        return;
      }

      const formData = new FormData();
      formData.append('category_name', values.name);
      formData.append('category_id', category.id);
      
      if (imageRemoved) {
        formData.append('removeImage', 'true');
      } else if (file && file.file) {
        formData.append('resim', file.file);
      }

      const response = await fetch(`${API_URL}/api/admin/categories/update/${category.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 403) {
          message.error('Bu işlem için yetkiniz yok!');
        } else if (response.status === 401) {
          message.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          throw new Error('Kategori güncellenemedi!');
        }
        return;
      }

      message.success('Kategori başarıyla güncellendi!');
      form.resetFields(); // Form'u temizle
      setFile(null); // Dosya state'ini temizle
      setImageRemoved(false); // Image removed state'ini temizle
      onOk();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      message.error('Kategori güncellenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields(); // Form'u temizle
    setFile(null); // Dosya state'ini temizle
    setImageRemoved(false); // Image removed state'ini temizle
    onCancel();
  };

  return (
    <Modal
      title="Kategoriyi Düzenle"
      visible={visible}
      onOk={handleOkClick}
      onCancel={handleCancel}
      okText="Güncelle"
      cancelText="İptal"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="İsim"
          name="name"
          rules={[{ required: true, message: 'Lütfen kategori ismini girin!' }]}
        >
          <Input placeholder="Kategori ismini girin" />
        </Form.Item>

        <Form.Item label="Resim Yükle" name="upload">
          {file ? (
            <>
              <img 
                src={file.preview} 
                style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                alt="Category"
              />
              <Button type="primary" onClick={handleRemove} style={{ marginLeft: '10px', marginTop: '10px' }}>
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
      </Form>
    </Modal>
  );
};

export default EditCategoryModal;
