import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Row, Col, Slider, message, Typography, Card, Select } from 'antd';
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
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        // Token'ı localStorage'dan al
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token bulunamadı, lütfen tekrar giriş yapın');
        }

        const res = await fetch(`${API_URL}/api/branches/1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Oturum süreniz dolmuş, lütfen tekrar giriş yapın');
          } else if (res.status === 403) {
            throw new Error('Bu işlem için yetkiniz bulunmuyor');
          } else {
            throw new Error(`Şubeler alınamadı (${res.status})`);
          }
        }
        
        const data = await res.json();
        console.log('✅ Şubeler yüklendi:', data);
        console.log('🔍 Şube sayısı:', data.length);
        console.log('🔍 İlk şube örneği:', data[0]);
        setBranches(data);
      } catch (err) {
        console.error('❌ Şubeler yüklenirken hata:', err);
        message.error(err.message || 'Şubeler yüklenemedi');
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  const handleGenerate = async () => {
    try {
      console.log('Seçilen değerler:', { selectedBranchId, qrUrl });
      
      // Manuel kontrol - form yerine state kullan
      if (!selectedBranchId) {
        message.error('Lütfen bir şube seçin');
        return;
      }
      
      if (!qrUrl) {
        message.error('Lütfen bir URL girin');
        return;
      }
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Oturum bilgisi bulunamadı, lütfen tekrar giriş yapın');
        return;
      }
      
      console.log('Token:', token);
      
      const formData = new FormData();
      formData.append('business_id', 1); // test için
      formData.append('type', 'nonorderable');
      formData.append('base_url', qrUrl); // Değişiklik: qr_url yerine base_url
      formData.append('color', color);
      formData.append('size', size);
      formData.append('logo_size_percent', logoSizePercent);
      formData.append('branch_id', selectedBranchId);
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      console.log('FormData içeriği:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await fetch(`${API_URL}/api/table_qr/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sunucu hatası:', response.status, errorText);
        throw new Error(`Sunucu hatası: ${response.status}`);
      }
      
      const data = await response.json();
      setQrFilePath(data.file_path);
      message.success('QR kodu başarıyla oluşturuldu!');
    } catch (err) {
      console.error('QR oluşturma hatası:', err);
      message.error('QR oluşturulurken bir hata oluştu: ' + err.message);
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
        <div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>
              Şube
            </div>
            <Select
              loading={loadingBranches}
              placeholder="Şube Seçin"
              style={{ width: '100%' }}
              value={selectedBranchId}
              options={branches.map(branch => ({
                value: branch.id || branch.branch_id,
                label: branch.name || branch.branch_name || 'İsimsiz Şube'
              }))}
              onChange={(value) => {
                console.log('Seçilen şube ID:', value);
                setSelectedBranchId(value);
              }}
              status={!selectedBranchId && 'error'}
            />
            {!selectedBranchId && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>Şube seçimi gerekli</div>}
            {loadingBranches && <div style={{ color: '#1890ff', fontSize: '12px', marginTop: '4px' }}>Şubeler yükleniyor...</div>}
            {!loadingBranches && branches.length === 0 && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>Şube bulunamadı</div>}
            {!loadingBranches && branches.length > 0 && <div style={{ color: '#52c41a', fontSize: '12px', marginTop: '4px' }}>{branches.length} şube bulundu</div>}
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>
              Yönlendirme URL'si
            </div>
            <Input 
              placeholder="https://ornekmenu.com/menu" 
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              status={!qrUrl && 'error'}
            />
            {!qrUrl && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>URL gerekli</div>}
          </div>

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

          <Button type="primary" onClick={handleGenerate}>QR Oluştur</Button>
        </div>
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
                value={qrUrl || 'https://ornekmenu.com'}
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
