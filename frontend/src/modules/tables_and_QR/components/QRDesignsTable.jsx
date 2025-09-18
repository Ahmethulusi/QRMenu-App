import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL;

const QRDesignsTable = ({ businessId }) => {
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchQRCodes = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Token bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      console.log('🔄 QR kodları getiriliyor...');
      const res = await fetch(`${API_URL}/api/table_qr/nonorderable-list/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          message.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else if (res.status === 403) {
          message.error('Bu işlem için yetkiniz bulunmuyor.');
        } else {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
        }
        return;
      }

      const data = await res.json();
      console.log("✅ Gelen QR verisi:", data);

      if (Array.isArray(data)) {
        setQrList(data);
        console.log(`✅ ${data.length} QR kodu başarıyla yüklendi`);
      } else {
        message.error('Beklenmeyen veri formatı!');
        console.error('Veri:', data);
      }
    } catch (err) {
      console.error('❌ QR kodları alınamadı:', err);
      message.error(`QR kodları alınamadı: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, [businessId]);

  const handleActivate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Token bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      const res = await fetch(`${API_URL}/api/table_qr/${id}/activate`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ business_id: businessId }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          message.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else if (res.status === 403) {
          message.error('Bu işlem için yetkiniz bulunmuyor.');
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return;
      }

      message.success('QR aktif edildi!');
      fetchQRCodes();
    } catch (err) {
      console.error('❌ Aktiflik güncellenemedi:', err);
      message.error(`Aktiflik güncellenemedi: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Token bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      const res = await fetch(`${API_URL}/api/table_qr/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        message.success('QR silindi!');
        fetchQRCodes();
      } else {
        if (res.status === 401) {
          message.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        } else if (res.status === 403) {
          message.error('Bu işlem için yetkiniz bulunmuyor.');
        } else {
          const data = await res.json();
          message.error(data.error || 'Silme işlemi başarısız!');
        }
      }
    } catch (err) {
      console.error('❌ Silme işlemi başarısız:', err);
      message.error(`Silme işlemi başarısız: ${err.message}`);
    }
  };

  const columns = [
    {
      title: 'Önizleme',
      dataIndex: 'file_path',
      key: 'file_path',
      render: file => file && (
        <img
          src={`${API_URL}${file}`}
          alt="QR"
          style={{ width: 64, height: 64, objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Şube Adı',
      dataIndex: ['Branch', 'name'],
      key: 'branch_name',
      render: (branchName, record) => {
        if (record.branch_id && branchName) {
          return branchName;
        }
        return record.branch_id ? 'Şube bulunamadı' : 'Genel QR';
      },
    },
    {
      title: 'URL',
      dataIndex: 'qr_url',
      key: 'qr_url',
    },
    {
      title: 'Renk',
      dataIndex: 'color',
      key: 'color',
      render: color => <span style={{ color }}>{color}</span>,
    },
    {
      title: 'Boyut',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Durum',
      dataIndex: 'is_active',
      key: 'is_active',
      render: active => active ? <Tag color="green">Aktif</Tag> : <Tag color="red">Pasif</Tag>,
    },
    {
      title: 'İşlem',
      key: 'action',
      render: (_, record) => (
        <>
          {!record.is_active && (
            <Button onClick={() => handleActivate(record.id)} style={{ marginRight: 8 }}>Aktif Yap</Button>
          )}
          <Popconfirm
            title="Bu QR kodunu silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button danger icon={<DeleteOutlined style={{ color: 'white' }} />}>Sil</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h3>QR Tasarımları</h3>
      <Table
        dataSource={qrList}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{x: 1100, y: 400 }}  // Yeni sütun için genişlik artırıldı
      />
    </div>
  );
};

export default QRDesignsTable;
