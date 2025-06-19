import React from 'react';
import { Button, Upload, message, Tooltip } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL;

const ExcelImportButton = ({ onSuccess }) => {
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('excel', file);

    try {
      const response = await fetch(`${API_URL}/api/admin/uploadExcel`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Excel yüklemede bir hata oluştu');
      }

      const data = await response.json();
      message.success('Excel dosyası başarıyla yüklendi');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Excel yükleme hatası:', error);
      message.error(error.message || 'Excel dosyası yüklenirken bir hata oluştu');
    }
  };

  return (
    <div style={{ display: 'inline-block', marginLeft: '20px', position: 'relative', top: '2px',marginBottom: '20px' }}>
      <Upload
        accept=".xlsx,.xls"
        beforeUpload={() => false}
        onChange={info => handleUpload(info)}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />} type="primary">
          Import Data
        </Button>
      </Upload>
      <Tooltip title={
        <div>
          <p>Excel dosyası için zorunlu alanlar:</p>
          <ul>
            <li>Ürün Adi (product_name) </li>
            <li>Fiyat (price)</li>
            <li>Kategori ID (category_id)</li>
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