import React, { useState, useEffect } from 'react';
import { 
  message, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Switch, 
  Popconfirm, 
  Input, 
  Select, 
  Card, 
  Typography, 
  Spin, 
  InputNumber,
  Tooltip,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  SearchOutlined,
  CalendarOutlined,
  TagOutlined,
  PercentageOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { apiGet, apiDelete, apiPatch } from '../../common/utils/api';
import AnnouncementFormModal from './AnnouncementFormModal';
// import '../../../css/announcements.css';

const API_URL = import.meta.env.VITE_API_URL;
const { Title, Text } = Typography;
const { Option } = Select;

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ['5', '10', '20', '50'],
      showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} duyuru`
    },
    sorter: {
      field: 'priority',
      order: 'descend'
    }
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      
      const response = await apiGet('/api/announcements/all');
      
      if (response.success || response.data?.success) {
        const announcementsData = response.data || response;
        setAnnouncements(announcementsData);
      } else {
        message.error('Duyurular yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Duyurular getirilirken hata:', error);
      message.error('Duyurular yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingAnnouncement(null);
    setShowModal(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      try {
        const response = await apiDelete(`/api/announcements/${id}`);
        if (response.success || response.data?.success) {
          message.success('Duyuru başarıyla silindi!');
          
          // State'den anında kaldır
          setAnnouncements(prevAnnouncements => 
            prevAnnouncements.filter(announcement => announcement.id !== id)
          );
        }
      } catch (error) {
        console.error('Duyuru silinirken hata:', error);
        message.error('Duyuru silinirken bir hata oluştu!');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await apiPatch(`/api/announcements/${id}/toggle-status`);
      if (response.success || response.data?.success) {
        message.success('Duyuru durumu başarıyla güncellendi!');
        
        // State'i anında güncelle
        setAnnouncements(prevAnnouncements => 
          prevAnnouncements.map(announcement => 
            announcement.id === id 
              ? { ...announcement, is_active: !announcement.is_active }
              : announcement
          )
        );
      }
    } catch (error) {
      console.error('Duyuru durumu değiştirilirken hata:', error);
      message.error('Duyuru durumu güncellenirken bir hata oluştu!');
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    try {
      const response = await apiPatch(`/api/announcements/${id}/priority`, {
        priority: newPriority
      });
      if (response.success || response.data?.success) {
        message.success('Duyuru önceliği başarıyla güncellendi!');
        
        // State'i anında güncelle
        setAnnouncements(prevAnnouncements => 
          prevAnnouncements.map(announcement => 
            announcement.id === id 
              ? { ...announcement, priority: newPriority }
              : announcement
          )
        );
      }
    } catch (error) {
      console.error('Öncelik güncellenirken hata:', error);
      message.error('Öncelik güncellenirken bir hata oluştu!');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
  };

  const handleModalSuccess = (updatedAnnouncement) => {
    if (updatedAnnouncement) {
      if (editingAnnouncement) {
        // Edit işlemi - mevcut duyuruyu güncelle
        setAnnouncements(prevAnnouncements => 
          prevAnnouncements.map(announcement => 
            announcement.id === editingAnnouncement.id 
              ? updatedAnnouncement 
              : announcement
          )
        );
      } else {
        // Yeni duyuru - listeye ekle
        setAnnouncements(prevAnnouncements => [updatedAnnouncement, ...prevAnnouncements]);
      }
    } else {
      // Eski yöntem - tüm listeyi yeniden çek
      fetchAnnouncements();
    }
    
    handleModalClose();
  };

  const getTypeTag = (type) => {
    const typeConfig = {
      'general': { color: 'blue', icon: <TagOutlined />, text: 'Genel' },
      'promotion': { color: 'purple', icon: <PercentageOutlined />, text: 'Promosyon' },
      'campaign': { color: 'green', icon: <GiftOutlined />, text: 'Kampanya' },
      'discount': { color: 'red', icon: <PercentageOutlined />, text: 'İndirim' }
    };
    
    const config = typeConfig[type] || typeConfig.general;
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'visual_only': 'Sadece Görsel',
      'visual_text': 'Görsel + Metin',
      'subscription_form': 'Abonelik Formu',
      'text_image_button': 'Metin + Görsel + Buton',
      'newsletter_form': 'Newsletter Formu',
      'countdown_timer': 'Geri Sayım Sayacı',
      'countdown_image': 'Geri Sayım + Görsel'
    };
    return categoryLabels[category] || category;
  };

  const getStatusBadge = (isActive) => {
    return (
      <Badge 
        status={isActive ? 'success' : 'default'} 
        text={isActive ? 'Aktif' : 'Pasif'} 
      />
    );
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      sorter: {
        field: sorter.field,
        order: sorter.order
      }
    });
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const typeMatch = filterType === 'all' || announcement.type === filterType;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'active' && announcement.is_active) ||
      (filterStatus === 'inactive' && !announcement.is_active);
    const searchMatch = !searchText || 
      announcement.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (announcement.content && announcement.content.toLowerCase().includes(searchText.toLowerCase()));
    
    return typeMatch && statusMatch && searchMatch;
  });

  // Tablo sütunları
  const columns = [
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      sorter: (a, b) => a.priority - b.priority,
      render: (priority, record) => (
        <InputNumber
          min={0}
          value={priority}
          onChange={(value) => handlePriorityChange(record.id, value)}
          style={{ width: '70px' }}
        />
      ),
    },
    {
      title: 'Görsel',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 80,
      render: (image_url, record) => (
        image_url ? (
          <img 
            src={`${API_URL}/images/${image_url}`} 
            alt={record.title}
            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2060%2060%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%2260%22%20height%3D%2260%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2218%22%20y%3D%2230%22%3E%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
            }}
          />
        ) : (
          <div style={{ width: '60px', height: '60px', background: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '4px' }}>
            <Text type="secondary">Yok</Text>
          </div>
        )
      ),
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title, record) => (
        <Tooltip title={record.content || 'İçerik yok'}>
          <Text strong>{title}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      filters: [
        { text: 'Genel', value: 'general' },
        { text: 'Promosyon', value: 'promotion' },
        { text: 'Kampanya', value: 'campaign' },
        { text: 'İndirim', value: 'discount' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) => getTypeTag(type || 'general'),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => category ? getCategoryLabel(category) : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (isActive) => getStatusBadge(isActive),
    },
    {
      title: 'Tarih Aralığı',
      key: 'date_range',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.start_date && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <CalendarOutlined /> Başlangıç: {new Date(record.start_date).toLocaleDateString('tr-TR')}
            </Text>
          )}
          {record.end_date && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <CalendarOutlined /> Bitiş: {new Date(record.end_date).toLocaleDateString('tr-TR')}
            </Text>
          )}
          {!record.start_date && !record.end_date && '-'}
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            Düzenle
          </Button>
          <Button
            type={record.is_active ? "default" : "primary"}
            icon={record.is_active ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            size="small"
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.is_active ? 'Pasif Yap' : 'Aktif Yap'}
          </Button>
          <Popconfirm
            title="Bu duyuruyu silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            >
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '50px' }}>
        <Spin size="large" tip="Duyurular yükleniyor..." />
      </div>
    );
  }

  return (
    <Card className="announcements-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={4} style={{ margin: 0 }}>Duyurular</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreateNew}
        >
          Yeni Duyuru
        </Button>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Input.Search
          placeholder="Duyurularda ara..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton={<SearchOutlined />}
        />
        
        <Select
          style={{ width: 180 }}
          placeholder="Tür filtresi"
          value={filterType}
          onChange={setFilterType}
        >
          <Option value="all">Tüm Türler</Option>
          <Option value="general">Genel</Option>
          <Option value="promotion">Promosyon</Option>
          <Option value="campaign">Kampanya</Option>
          <Option value="discount">İndirim</Option>
        </Select>
        
        <Select
          style={{ width: 150 }}
          placeholder="Durum filtresi"
          value={filterStatus}
          onChange={setFilterStatus}
        >
          <Option value="all">Tüm Durumlar</Option>
          <Option value="active">Aktif</Option>
          <Option value="inactive">Pasif</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredAnnouncements.map(item => ({ ...item, key: item.id }))}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1100 }}
        size="middle"
        bordered
        className="announcements-table"
        style={{ border: '1px solid #f0f0f0' }}
      />

      {showModal && (
        <AnnouncementFormModal
          announcement={editingAnnouncement}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </Card>
  );
};

export default Announcements;
