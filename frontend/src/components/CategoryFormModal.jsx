import React, { useState } from 'react';
import { Modal, Form, Input, Button, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../css/CategoryFormModal.css';

const ModalForm = ({ visible, onCancel, onOk }) => {
  const [form] = Form.useForm(); // Form kontrolü
  const [file, setFile] = useState(null); // Yüklenen dosya

  // Resim yükleme değişikliği olduğunda çalışır
  const handleUpload = ({ file }) => {
    setFile(file);
  };

  // Form submit edildiğinde çağrılan fonksiyon
  const handleOk = async () => {
    try {
      // Form alanlarını doğrula
      const values = await form.validateFields();

      if (!file) {
        message.error('Lütfen bir resim yükleyin!');
        return;
      }

      const formData = new FormData();
      formData.append('resim', file);
      formData.append('category_name', values.name); 

      console.log('Gönderilen veri:', { category_name: values.name, resim: file });

      // Backend'e veri gönderme
      const response = await fetch('http://localhost:5000/api/admin/categories/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      form.resetFields(); // Formu temizle
      setFile(null); // Yüklenen dosya listesini temizle
      onOk();
      message.success('Kategori oluşturuldu!'); 
    } catch (error) {
      console.log('Form Hatası:', error);
      message.error('Kategori oluşturulurken bir hata oluştu!');
    }
  };

  return (
    <Modal
      title="Kategori Oluştur"
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Gönder"
      cancelText="İptal"
      width={400}
    >
      {/* Form Bileşeni */}
      <Form form={form} layout="vertical">
        <Form.Item
          label="İsim"
          name="name" 
          rules={[{ required: true, message: 'Lütfen isminizi giriniz!' }]}
        >
          <Input placeholder="İsminizi girin" />
        </Form.Item>

        {/* Resim Yükleme Alanı */}
        <Form.Item label="Resim Yükle" name="upload">
          <Upload
            accept="image/*"
            listType="picture-card"
            beforeUpload={() => false}  // Otomatik yüklemeyi engelle
            onChange={info => handleUpload(info)}    // Dosya değişikliklerini yönet
            showUploadList={false}
          >
            {file ? (
              <img
                src={URL.createObjectURL(file)}
                alt="Resim"
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

export default ModalForm;
