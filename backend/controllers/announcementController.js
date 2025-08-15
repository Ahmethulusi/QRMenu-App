const { Announcement } = require('../models');
const { Op } = require('sequelize');

// Tüm duyuruları getir
const getAllAnnouncements = async (req, res) => {
  try {
    console.log('🔍 Tüm duyurular getiriliyor...');
    
    const announcements = await Announcement.findAll({
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
    
    console.log(`✅ ${announcements.length} duyuru bulundu:`, announcements.map(a => ({ id: a.id, title: a.title, category: a.category })));
    
    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('❌ Duyurular getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Duyurular getirilirken bir hata oluştu'
    });
  }
};

// Aktif duyuruları getir
const getActiveAnnouncements = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const announcements = await Announcement.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          {
            start_date: {
              [Op.lte]: currentDate
            }
          },
          {
            start_date: null
          }
        ],
        [Op.or]: [
          {
            end_date: {
              [Op.gte]: currentDate
            }
          },
          {
            end_date: null
          }
        ]
      },
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('Aktif duyurular getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Aktif duyurular getirilirken bir hata oluştu'
    });
  }
};

// ID'ye göre duyuru getir
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findByPk(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }
    
    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Duyuru getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Duyuru getirilirken bir hata oluştu'
    });
  }
};

// Yeni duyuru oluştur
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      priority,
      is_active,
      start_date,
      end_date,
      delay,
      button_text,
      button_color,
      button_url,
      countdown_date,
      subscription_form_fields,
      newsletter_form_fields,
      layout_config
    } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Başlık ve kategori alanları zorunludur'
      });
    }
    
    // Görsel dosyalarını kontrol et
    const imageUrl = req.files?.image ? req.files.image[0].filename : null;
    const backgroundImageUrl = req.files?.background_image ? req.files.background_image[0].filename : null;
    
    // Integer alanları düzelt
    const priorityValue = priority && priority !== '' ? parseInt(priority) : 0;
    const delayValue = delay && delay !== '' ? parseInt(delay) : null;
    
    // Tarih formatlarını kontrol et
    let formattedStartDate = null;
    let formattedEndDate = null;
    let formattedCountdownDate = null;
    
    if (start_date && start_date !== '') {
      formattedStartDate = new Date(start_date);
      if (isNaN(formattedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz başlangıç tarihi formatı'
        });
      }
    }
    
    if (end_date && end_date !== '') {
      formattedEndDate = new Date(end_date);
      if (isNaN(formattedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz bitiş tarihi formatı'
        });
      }
    }
    
    if (countdown_date && countdown_date !== '') {
      formattedCountdownDate = new Date(countdown_date);
      if (isNaN(formattedCountdownDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz geri sayım tarihi formatı'
        });
      }
    }
    
    const announcement = await Announcement.create({
      title,
      content: content || '',
      image_url: imageUrl,
      category,
      priority: priorityValue,
      is_active: is_active !== undefined ? is_active : true,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      delay: delayValue,
      button_text: button_text || '',
      button_color: button_color || '#007bff',
      button_url: button_url || '',
      background_image_url: backgroundImageUrl,
      countdown_date: formattedCountdownDate,
      subscription_form_fields: subscription_form_fields ? JSON.parse(subscription_form_fields) : null,
      newsletter_form_fields: newsletter_form_fields ? JSON.parse(newsletter_form_fields) : null,
      layout_config: layout_config ? JSON.parse(layout_config) : null
    });
    
    console.log('🎉 Duyuru oluşturuldu:', announcement.toJSON());
    
    const responseData = {
      success: true,
      message: 'Duyuru başarıyla oluşturuldu',
      data: announcement
    };
    
    console.log('📤 Response gönderiliyor:', responseData);
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Duyuru oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Duyuru oluşturulurken bir hata oluştu'
    });
  }
};

// Duyuru güncelle
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const announcement = await Announcement.findByPk(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }
    
    // Görsel dosyalarını kontrol et
    if (req.files?.image) {
      updateData.image_url = req.files.image[0].filename;
    }
    if (req.files?.background_image) {
      updateData.background_image_url = req.files.background_image[0].filename;
    }
    
    // Integer alanları düzelt
    if (updateData.priority !== undefined) {
      updateData.priority = updateData.priority && updateData.priority !== '' ? parseInt(updateData.priority) : 0;
    }
    if (updateData.delay !== undefined) {
      updateData.delay = updateData.delay && updateData.delay !== '' ? parseInt(updateData.delay) : null;
    }
    
    // Tarih formatlarını kontrol et
    if (updateData.start_date !== undefined) {
      if (updateData.start_date && updateData.start_date !== '') {
        const startDate = new Date(updateData.start_date);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz başlangıç tarihi formatı'
          });
        }
        updateData.start_date = startDate;
      } else {
        updateData.start_date = null;
      }
    }
    
    if (updateData.end_date !== undefined) {
      if (updateData.end_date && updateData.end_date !== '') {
        const endDate = new Date(updateData.end_date);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz bitiş tarihi formatı'
          });
        }
        updateData.end_date = endDate;
      } else {
        updateData.end_date = null;
      }
    }
    
    if (updateData.countdown_date !== undefined) {
      if (updateData.countdown_date && updateData.countdown_date !== '') {
        const countdownDate = new Date(updateData.countdown_date);
        if (isNaN(countdownDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Geçersiz geri sayım tarihi formatı'
          });
        }
        updateData.countdown_date = countdownDate;
      } else {
        updateData.countdown_date = null;
      }
    }
    
    // JSON alanları parse et
    if (updateData.subscription_form_fields && typeof updateData.subscription_form_fields === 'string') {
      try {
        updateData.subscription_form_fields = JSON.parse(updateData.subscription_form_fields);
      } catch (e) {
        updateData.subscription_form_fields = null;
      }
    }
    
    if (updateData.newsletter_form_fields && typeof updateData.newsletter_form_fields === 'string') {
      try {
        updateData.newsletter_form_fields = JSON.parse(updateData.newsletter_form_fields);
      } catch (e) {
        updateData.newsletter_form_fields = null;
      }
    }
    
    if (updateData.layout_config && typeof updateData.layout_config === 'string') {
      try {
        updateData.layout_config = JSON.parse(updateData.layout_config);
      } catch (e) {
        updateData.layout_config = null;
      }
    }
    
    await announcement.update(updateData);
    
    res.json({
      success: true,
      message: 'Duyuru başarıyla güncellendi',
      data: announcement
    });
  } catch (error) {
    console.error('Duyuru güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Duyuru güncellenirken bir hata oluştu'
    });
  }
};

// Duyuru sil
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findByPk(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }
    
    await announcement.destroy();
    
    res.json({
      success: true,
      message: 'Duyuru başarıyla silindi'
    });
  } catch (error) {
    console.error('Duyuru silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Duyuru silinirken bir hata oluştu'
    });
  }
};

// Duyuru durumunu değiştir (aktif/pasif)
const toggleAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findByPk(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }
    
    announcement.is_active = !announcement.is_active;
    await announcement.save();
    
    res.json({
      success: true,
      message: `Duyuru ${announcement.is_active ? 'aktif' : 'pasif'} yapıldı`,
      data: announcement
    });
  } catch (error) {
    console.error('Duyuru durumu değiştirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Duyuru durumu değiştirilirken bir hata oluştu'
    });
  }
};

// Duyuru önceliğini güncelle
const updateAnnouncementPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    
    // Priority değerini integer'a çevir
    const priorityValue = parseInt(priority);
    
    if (isNaN(priorityValue) || priorityValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir öncelik değeri giriniz'
      });
    }
    
    const announcement = await Announcement.findByPk(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }
    
    announcement.priority = priorityValue;
    await announcement.save();
    
    res.json({
      success: true,
      message: 'Duyuru önceliği güncellendi',
      data: announcement
    });
  } catch (error) {
    console.error('Duyuru önceliği güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Duyuru önceliği güncellenirken bir hata oluştu'
    });
  }
};

// Kategoriye göre duyuruları getir
const getAnnouncementsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const announcements = await Announcement.findAll({
      where: {
        category: category,
        is_active: true
      },
      order: [['priority', 'DESC'], ['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('Kategoriye göre duyurular getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriye göre duyurular getirilirken bir hata oluştu'
    });
  }
};

module.exports = {
  getAllAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  updateAnnouncementPriority,
  getAnnouncementsByCategory
};
