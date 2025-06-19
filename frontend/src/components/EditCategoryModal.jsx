import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL;

const EditCategoryModal = ({ visible, onCancel, onOk, category }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null); // Yeni dosya yükleme
  const [previewImage, setPreviewImage] = useState(null); // Önceki dosyanın önizlemesi

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
      });
      setPreviewImage(category.imageUrl); // Mevcut resmi önizleme için ayarla
    }
  }, [category, form]);

  const handleUpload = ({ file }) => {
    setFile(file.originFileObj); // Yüklenen dosyayı kaydet
  };

  const handleOkClick = async () => {
    try {
      const values = await form.validateFields();
      if (!values.name) {
        message.error('Kategori ismi boş olamaz!');
        return;
      }

      const formData = new FormData();
      formData.append('category_name', values.name);
      if (file) {
        formData.append('resim', file); // Yeni dosyayı ekle
      }

      formData.append('category_id', category.id); // Kategori ID'sini ekle

      const response = await fetch(`${API_URL}/api/admin/categories/update/${category.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Kategori güncellenemedi!');
      }

      form.resetFields();
      setFile(null);
      setPreviewImage(null); // Form temizleme işlemi
      onOk();
      message.success('Kategori güncellendi!');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      message.error('Kategori güncellenirken bir hata oluştu!');
    }
  };

  return (
    <Modal
      title="Kategoriyi Düzenle"
      visible={visible}
      onOk={handleOkClick}
      onCancel={onCancel}
      okText="Güncelle"
      cancelText="İptal"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="İsim"
          name="name"
          rules={[{ required: true, message: 'Lütfen kategori ismini girin!' }]}
        >
          <Input placeholder="Kategori ismini girin" />
        </Form.Item>

        <Form.Item label="Mevcut Resim">
          {previewImage ? (
            <img
              src={`${API_URL}/images/${previewImage}`} // Backend'den gelen resim yolu
              alt="Mevcut Resim"
              style={{ width: '50%', marginBottom: '10px' }}
            />
          ) : (
            <div>Resim yok</div>
          )}
        </Form.Item>

        <Form.Item label="Yeni Resim Yükle" name="upload">
          <Upload
            accept="image/*"
            listType="picture-card"
            beforeUpload={() => false} // Otomatik yükleme yapma
            onChange={handleUpload}
            showUploadList={false}
          >
            {file ? (
              <img
                src={URL.createObjectURL(file)}
                alt="Yeni Resim"
                style={{ width: '100%' }}
              />
            ) : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Resim Yükle</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCategoryModal;
