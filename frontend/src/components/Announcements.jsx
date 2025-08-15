import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { apiGet, apiDelete, apiPatch } from '../utils/api';
import AnnouncementFormModal from './AnnouncementFormModal';
import '../css/announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  console.log('🎯 Announcements component render - announcements:', announcements);
  console.log('🎯 Announcements component render - loading:', loading);

  useEffect(() => {
    console.log('🚀 useEffect çalıştı - fetchAnnouncements çağrılıyor...');
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      console.log('🔄 Duyurular getiriliyor...');
      
      const response = await apiGet('/api/announcements/all');
      console.log('📦 API Response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response keys:', Object.keys(response));
      console.log('📦 Response.data:', response.data);
      console.log('📦 Response.success:', response.success);
      console.log('📦 Response.data.success:', response.data?.success);
      
      // Response yapısını kontrol et
      if (response.success || response.data?.success) {
        const announcementsData = response.data || response;
        console.log('✅ Duyurular başarıyla getirildi:', announcementsData);
        setAnnouncements(announcementsData);
      } else {
        console.log('❌ API başarısız:', response);
      }
    } catch (error) {
      console.error('❌ Duyurular getirilirken hata:', error);
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
    console.log('🎉 Modal success - duyuru güncelleniyor:', updatedAnnouncement);
    
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
      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? 'Aktif' : 'Pasif'}
      </span>
    );
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const categoryMatch = filterCategory === 'all' || announcement.category === filterCategory;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'active' && announcement.is_active) ||
      (filterStatus === 'inactive' && !announcement.is_active);
    
    return categoryMatch && statusMatch;
  });

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="announcements-container">
      <div className="announcements-header">
        <h2>Duyurular</h2>
        <button className="btn btn-primary" onClick={handleCreateNew}>
          + Yeni Duyuru
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Kategori:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Tümü</option>
            <option value="visual_only">Sadece Görsel</option>
            <option value="visual_text">Görsel + Metin</option>
            <option value="subscription_form">Abonelik Formu</option>
            <option value="text_image_button">Metin + Görsel + Buton</option>
            <option value="newsletter_form">Newsletter Formu</option>
            <option value="countdown_timer">Geri Sayım Sayacı</option>
            <option value="countdown_image">Geri Sayım + Görsel</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Durum:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
      </div>

      <div className="announcements-table">
        <table>
          <thead>
            <tr>
              <th>Öncelik</th>
              <th>Başlık</th>
              <th>Kategori</th>
              <th>Durum</th>
              <th>Başlangıç</th>
              <th>Bitiş</th>
              <th>Oluşturulma</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnnouncements.map((announcement) => (
              <tr key={announcement.id}>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={announcement.priority}
                    onChange={(e) => handlePriorityChange(announcement.id, parseInt(e.target.value))}
                    className="priority-input"
                  />
                </td>
                <td>{announcement.title}</td>
                <td>{getCategoryLabel(announcement.category)}</td>
                <td>{getStatusBadge(announcement.is_active)}</td>
                <td>
                  {announcement.start_date 
                    ? new Date(announcement.start_date).toLocaleDateString('tr-TR')
                    : '-'
                  }
                </td>
                <td>
                  {announcement.end_date 
                    ? new Date(announcement.end_date).toLocaleDateString('tr-TR')
                    : '-'
                  }
                </td>
                <td>
                  {new Date(announcement.created_at).toLocaleDateString('tr-TR')}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(announcement)}
                    >
                      Düzenle
                    </button>
                    <button
                      className={`btn btn-sm ${announcement.is_active ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleStatus(announcement.id)}
                    >
                      {announcement.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AnnouncementFormModal
          announcement={editingAnnouncement}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default Announcements;
