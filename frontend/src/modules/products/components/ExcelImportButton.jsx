import React from 'react';
import { Button, Upload, message, Tooltip } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL;

const ExcelImportButton = ({ onSuccess }) => {
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('excel', file);

    console.log('📁 Excel dosyası yükleniyor:', file.name, 'Boyut:', file.size, 'bytes');
    console.log('🌐 API URL:', `${API_URL}/api/admin/uploadExcel`);

    try {
      // Token'ı localStorage'dan al
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum bilgisi bulunamadı, lütfen tekrar giriş yapın');
      }

      console.log('🔑 Token mevcut, uzunluk:', token.length);
      console.log('🔑 Token başlangıcı:', token.substring(0, 20) + '...');

      console.log('📤 FormData içeriği:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      console.log('🚀 API çağrısı başlatılıyor...');

      const response = await fetch(`${API_URL}/api/admin/uploadExcel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 API Yanıtı alındı:', response.status, response.statusText);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // HTTP status koduna göre hata mesajı
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          console.log('🔍 400 Hata Detayı:', errorData); // Hata ayıklama için
          
          // 400 hatası için özel mesaj
          if (errorData.message && errorData.message.includes('Hiçbir ürün eklenmedi')) {
            message.warning('Excel dosyası yüklendi ancak hiçbir yeni ürün eklenmedi. Tüm ürünler sistemde zaten mevcut olabilir.');
            if (onSuccess) {
              onSuccess(); // Tabloyu yenile
            }
            return; // Hata olarak gösterme, sadece uyarı ver
          } else {
            // Diğer 400 hataları için daha detaylı mesaj
            const errorMessage = errorData.message || errorData.error || 'Excel dosyası formatı hatalı veya eksik veri içeriyor';
            console.error('❌ Excel Yükleme Hatası:', errorMessage);
            throw new Error(errorMessage);
          }
        } else if (response.status === 401) {
          throw new Error('Oturum süreniz dolmuş, lütfen tekrar giriş yapın');
        } else if (response.status === 403) {
          throw new Error('Bu işlem için yetkiniz bulunmuyor');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Excel yüklemede bir hata oluştu (${response.status})`);
        }
      }

      const data = await response.json()
      
      // Başarı mesajını daha detaylı göster
      if (data.message) {
        message.success(data.message);
      } else if (data.added_count > 0) {
        message.success(`${data.added_count} yeni ürün başarıyla eklendi!`);
      } else {
        message.success('Excel dosyası başarıyla işlendi');
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Excel yükleme hatası:', error);
      console.error('❌ Hata türü:', error.constructor.name);
      console.error('❌ Hata mesajı:', error.message);
      console.error('❌ Hata stack:', error.stack);
      
      // Network hatası kontrolü
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🌐 Network hatası - Backend erişilemiyor olabilir');
        message.error('Backend sunucusuna bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        message.error(error.message || 'Excel dosyası yüklenirken bir hata oluştu');
      }
    }
  };

  const testBackendConnection = async () => {
    try {
      console.log('🧪 Backend bağlantı testi başlatılıyor...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token bulunamadı');
        message.error('Token bulunamadı, lütfen tekrar giriş yapın');
        return;
      }

      // Mevcut products endpoint'ini kullanarak backend'i test et
      const testResponse = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🧪 Test response:', testResponse.status, testResponse.statusText);
      
      if (testResponse.ok) {
        console.log('✅ Backend bağlantısı başarılı');
        message.success('Backend bağlantısı çalışıyor');
      } else {
        console.log('❌ Backend test başarısız:', testResponse.status);
        message.error(`Backend test başarısız: ${testResponse.status}`);
      }
    } catch (error) {
      console.error('🧪 Test hatası:', error);
      message.error('Backend test hatası: ' + error.message);
    }
  };

  return (
    <div style={{ display: 'inline-block', marginLeft: '20px', position: 'relative', top: '2px',marginBottom: '20px' }}>
      {/* Test butonu */}
      <Button 
        onClick={testBackendConnection} 
        style={{ marginRight: '10px', backgroundColor: '#52c41a', color: 'white' }}
        size="small"
      >
        🧪 Test
      </Button>
      
      <Upload
        accept=".xlsx,.xls"
        beforeUpload={() => false}
        onChange={info => handleUpload(info)}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />} type="primary">
          İçeri Aktar
        </Button>
      </Upload>
      <Tooltip title={
        <div>
          <p>Excel dosyası için zorunlu alanlar:</p>
          <ul>
            <li>Ürün Adı </li>
            <li>Fiyat</li>
            <li>Kategori</li>
          </ul>
          <p>Opsiyonel alanlar:</p>
          <ul>
            <li>Açiklama (description)</li>
            <li>Vitrin (is_selected)</li>
            <li>Mevcutluk (is_available)</li>
            <li>Kalori (calorie_count)</li>
            <li>Pişirme Süresi (cooking_time)</li>
            <li>Stok</li>
          </ul>
        </div>
      }>
        <InfoCircleOutlined style={{ marginLeft: '8px', color: '#1890ff' }} />
      </Tooltip>
    </div>
  );
};

export default ExcelImportButton; 