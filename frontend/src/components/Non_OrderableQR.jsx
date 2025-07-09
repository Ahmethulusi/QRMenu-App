import React, { useState } from 'react';
import { Form, Input, Button, Upload, Row, Col, Slider, message, Typography, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import QRCode from 'react-qr-code';

const { Title } = Typography;
const API_URL = import.meta.env.VITE_API_URL;

const NonOrderableQR = () => {
  const [form] = Form.useForm();
  const [logoBase64, setLogoBase64] = useState('');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(256);
  const [qrFilePath, setQrFilePath] = useState('');
  const [logoSizePercent, setLogoSizePercent] = useState(20);
  const [logoFile, setLogoFile] = useState(null);

  const handleGenerate = async (values) => {
    try {
      const formData = new FormData();
      formData.append('business_id', 1); // test için
      formData.append('type', 'nonorderable');
      formData.append('qr_url', values.qr_url);
      formData.append('color', color);
      formData.append('size', size);
      formData.append('logo_size_percent', 20);
  
      if (logoFile) {
        formData.append('logo', logoFile);
      }
  
      const response = await fetch(`${API_URL}/api/table_qr`, {
        method: 'POST',
        body: formData,
        // !!! headers yazma, FormData kendi ayarlar
      });
  
      if (!response.ok) throw new Error('Sunucu hatası');
  
      const data = await response.json();
      setQrFilePath(data.file_path);
      message.success('QR kodu başarıyla oluşturuldu!');
    } catch (err) {
      console.error(err);
      message.error('QR oluşturulurken bir hata oluştu!');
    }
  };
  

  const handleImageUpload = (file) => {
    // Sadece resim dosyalarını kabul et
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Lütfen bir resim dosyası seçin!');
      return false;
    }
    // Maksimum boyut: 1MB
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('Resim 1MB\'dan küçük olmalı!');
      return false;
    }
    setLogoFile(file);
    // Base64'e çevir
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoBase64(e.target.result);
    };
    reader.readAsDataURL(file);
    return false; // upload'ı engelle
  };

  return (
    <Row gutter={32}>
      <Col xs={24} md={12}>
        <Title level={3}>Siparişsiz QR Oluştur</Title>
        <Form layout="vertical" form={form} onFinish={handleGenerate}>
          <Form.Item label="Yönlendirme URL'si" name="qr_url" rules={[{ required: true, message: 'URL gerekli' }]}>
            <Input placeholder="https://ornekmenu.com/menu" />
          </Form.Item>

          <Form.Item label="Renk">
            <Input type="color" value={color} onChange={e => setColor(e.target.value)} />
          </Form.Item>

          <Form.Item label="Boyut">
            <Slider min={128} max={512} value={size} onChange={setSize} />
          </Form.Item>

          <Form.Item label="Logo">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Upload beforeUpload={handleImageUpload} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />}>Logo Yükle</Button>
              </Upload>
              {logoBase64 && (
                <img src={logoBase64} alt="Logo Önizleme" style={{ maxWidth: 48, maxHeight: 48, border: '1px solid #eee', borderRadius: 6 }} />
              )}
            </div>
          </Form.Item>

          <Form.Item label="Logo Boyutu">
            <Slider
              min={10}
              max={40}
              value={logoSizePercent}
              onChange={setLogoSizePercent}
              tooltip={{ formatter: value => `%${value}` }}
              disabled={!logoBase64}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit">QR Oluştur</Button>
        </Form>
      </Col>

      <Col xs={24} md={12} style={{ textAlign: 'center' }}>
        <Title level={4}>Canlı Önizleme</Title>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: size + 40 }}>
          <Card
            style={{
              display: 'inline-block',
              padding: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              background: '#fff',
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div style={{ width: size, height: size, position: 'relative', margin: '0 auto' }}>
              <QRCode
                value={form.getFieldValue('qr_url') || 'https://ornekmenu.com'}
                bgColor="#ffffff"
                fgColor={color}
                size={size}
                style={{ width: size, height: size }}
              />
              {logoBase64 && (
                <img
                  src={logoBase64}
                  alt="Logo"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: `${(size * logoSizePercent) / 100}px`,
                    height: `${(size * logoSizePercent) / 100}px`,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '8px',
                    objectFit: 'contain',
                    background: '#fff',
                    padding: 2,
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                />
              )}
            </div>
          </Card>
        </div>

        {qrFilePath && (
          <div style={{ marginTop: '20px' }}>
            <a href={`${API_URL}${qrFilePath}`} target="_blank" rel="noopener noreferrer" download>
              PNG Olarak İndir
            </a>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default NonOrderableQR;
