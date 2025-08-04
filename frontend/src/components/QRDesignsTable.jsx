import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Popconfirm } from 'antd';

const API_URL = import.meta.env.VITE_API_URL;

const QRDesignsTable = ({ businessId }) => {
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchQRCodes = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/table_qr/nonorderable-list/${businessId}`);
      const data = await res.json();

      console.log("Gelen QR verisi:", data);

      if (Array.isArray(data)) {
        setQrList(data);
      } else {
        message.error('Beklenmeyen veri formatı!');
        console.error('Veri:', data);
      }
    } catch (err) {
      message.error('QR kodları alınamadı!');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQRCodes();
  }, [businessId]);

  const handleActivate = async (id) => {
    try {
      await fetch(`${API_URL}/api/table_qr/${id}/activate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId }),
      });
      message.success('QR aktif edildi!');
      fetchQRCodes();
    } catch (err) {
      message.error('Aktiflik güncellenemedi!');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/table_qr/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        message.success('QR silindi!');
        fetchQRCodes();
      } else {
        const data = await res.json();
        message.error(data.error || 'Silme işlemi başarısız!');
      }
    } catch (err) {
      message.error('Silme işlemi başarısız!');
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
            <Button danger>Sil</Button>
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
