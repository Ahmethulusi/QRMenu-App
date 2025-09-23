const { Announcement } = require('../models');
const { Op } = require('sequelize');
const { deleteImage, getImageUrl } = require('../middleware/uploadMiddleware');

// Tüm duyuruları getir
const getAllAnnouncements = async (req, res) => {
  try {
    console.log('🔍 Tüm duyurular getiriliyor...');
    
    const announcements = await Announcement.findAll({
      where: {
        business_id: req.user.business_id
      },
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
        business_id: req.user.business_id,
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
    
    const announcement = await Announcement.findOne({
      where: {
        id: id,
        business_id: req.user.business_id
      }
    });
    
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
    console.log('📥 Gelen istek:', req.body);
    
    const {
      title,
      content,
      type,
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
      layout_config,
      // Yeni alanlar
      discount_type,
      discount_value,
      applicable_products,
      applicable_categories,
      campaign_condition,
      campaign_reward
    } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Başlık alanı zorunludur'
      });
    }
    
    // Görsel dosyalarını kontrol et
    let imageUrl = null;
    if (req.files?.image) {
      imageUrl = `/public/images/${req.files.image[0].filename}`;
      console.log('📸 Yeni görsel yüklendi:', imageUrl);
    }
    
    let backgroundImageUrl = null;
    if (req.files?.background_image) {
      backgroundImageUrl = `/public/images/${req.files.background_image[0].filename}`;
      console.log('🖼️ Yeni arka plan görseli yüklendi:', backgroundImageUrl);
    }
    
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
    
    // JSON alanlarını işle
    let parsedApplicableProducts = null;
    let parsedApplicableCategories = null;
    
    if (applicable_products) {
      try {
        parsedApplicableProducts = typeof applicable_products === 'string' 
          ? JSON.parse(applicable_products) 
          : applicable_products;
      } catch (e) {
        console.error('Ürünler parse edilirken hata:', e);
      }
    }
    
    if (applicable_categories) {
      try {
        parsedApplicableCategories = typeof applicable_categories === 'string' 
          ? JSON.parse(applicable_categories) 
          : applicable_categories;
      } catch (e) {
        console.error('Kategoriler parse edilirken hata:', e);
      }
    }
    
    // discount_type kontrol
    let discountTypeValue = discount_type;
    if (discountTypeValue === 'undefined' || discountTypeValue === '') {
      console.log('⚠️ discount_type undefined veya boş string olarak geldi, null yapılıyor');
      discountTypeValue = null;
    }
    
    // Discount value'yu sayıya çevir
    let parsedDiscountValue = null;
    if (discount_value) {
      if (discount_value === 'undefined' || isNaN(parseFloat(discount_value))) {
        console.log('⚠️ discount_value geçersiz değer, null olarak bırakılıyor:', discount_value);
      } else {
        parsedDiscountValue = parseFloat(discount_value);
        console.log('✅ discount_value sayıya çevrildi:', parsedDiscountValue);
      }
    }
    
    // Kategori alanı için varsayılan değer atama
    let categoryValue = category;
    
    // Eğer kategori yoksa, type değerine göre bir varsayılan kategori atama
    if (!categoryValue) {
      switch (type) {
        case 'promotion':
          categoryValue = 'visual_text'; // Promosyonlar için varsayılan kategori
          break;
        case 'campaign':
          categoryValue = 'visual_text'; // Kampanyalar için varsayılan kategori
          break;
        case 'discount':
          categoryValue = 'visual_text'; // İndirimler için varsayılan kategori
          break;
        default:
          categoryValue = 'visual_only'; // Genel duyurular için varsayılan kategori
      }
      console.log(`🔄 Kategori belirtilmediği için varsayılan kategori atandı: ${categoryValue}`);
    }
    
    const announcementData = {
      title,
      content: content || '',
      image_url: imageUrl,
      type: type || 'general',
      category: categoryValue, // Varsayılan kategori kullanılıyor
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
      business_id: req.user.business_id, // Kullanıcının işletme ID'si
      
      // Yeni alanlar
      discount_type: discountTypeValue,
      discount_value: parsedDiscountValue,
      applicable_products: parsedApplicableProducts,
      applicable_categories: parsedApplicableCategories,
      campaign_condition: campaign_condition || null,
      campaign_reward: campaign_reward || null,
      
      // Eski alanlar
      subscription_form_fields: subscription_form_fields ? 
        (typeof subscription_form_fields === 'string' ? JSON.parse(subscription_form_fields) : subscription_form_fields) 
        : null,
      newsletter_form_fields: newsletter_form_fields ? 
        (typeof newsletter_form_fields === 'string' ? JSON.parse(newsletter_form_fields) : newsletter_form_fields) 
        : null,
      layout_config: layout_config ? 
        (typeof layout_config === 'string' ? JSON.parse(layout_config) : layout_config) 
        : null
    };
    
    console.log('🔧 Oluşturulacak duyuru verisi:', announcementData);
    
    let announcement;
    try {
      announcement = await Announcement.create(announcementData);
      console.log('🎉 Duyuru oluşturuldu:', announcement.toJSON());
    } catch (createError) {
      console.error('❌ Duyuru oluşturma hatası:', createError);
      console.error('❌ Hata detayı:', createError.message);
      if (createError.name === 'SequelizeDatabaseError') {
        console.error('❌ SQL hatası:', createError.parent?.message || 'Bilinmeyen SQL hatası');
      }
      throw createError;
    }
    
    const responseData = {
      success: true,
      message: 'Duyuru başarıyla oluşturuldu',
      data: announcement
    };
    
    console.log('📤 Response gönderiliyor:', responseData);
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('❌ Duyuru oluşturulurken hata:', error);
    console.error('❌ Hata tipi:', error.name);
    console.error('❌ Hata mesajı:', error.message);
    
    if (error.name === 'SequelizeDatabaseError') {
      console.error('❌ SQL hatası:', error.parent?.message || 'Bilinmeyen SQL hatası');
      console.error('❌ SQL kodu:', error.parent?.code || 'Bilinmeyen SQL kodu');
      console.error('❌ SQL durumu:', error.parent?.state || 'Bilinmeyen SQL durumu');
    }
    
    if (error.name === 'SequelizeValidationError') {
      console.error('❌ Doğrulama hataları:', error.errors.map(e => e.message));
    }
    
    res.status(500).json({
      success: false,
      message: 'Duyuru oluşturulurken bir hata oluştu',
      error: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        message: error.message,
        sql: error.parent?.message,
        detail: error.errors?.map(e => e.message)
      } : undefined
    });
  }
};

// Duyuru güncelle
const updateAnnouncement = async (req, res) => {
  try {
    console.log('📥 Güncelleme isteği:', req.body);
    
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
      // Dosya adını direkt olarak kaydet, /public/images/ öneki olmadan
      updateData.image_url = req.files.image[0].filename;
      console.log('📸 Yeni görsel yüklendi:', updateData.image_url);
    } else if (req.body.existing_image_path) {
      // Mevcut görsel korunuyor, eğer tam yol ise sadece dosya adını al
      const existingPath = req.body.existing_image_path;
      if (existingPath.includes('/public/images/')) {
        // /public/images/ önekini kaldır
        updateData.image_url = existingPath.split('/public/images/').pop();
      } else if (existingPath.includes('/')) {
        // Başka bir yol formatı varsa en son / sonrasını al
        updateData.image_url = existingPath.split('/').pop();
      } else {
        // Zaten sadece dosya adı ise olduğu gibi kullan
        updateData.image_url = existingPath;
      }
      console.log('🖼️ Mevcut görsel korunuyor:', updateData.image_url);
    }
    
    if (req.files?.background_image) {
      // Dosya adını direkt olarak kaydet, /public/images/ öneki olmadan
      updateData.background_image_url = req.files.background_image[0].filename;
      console.log('🖼️ Yeni arka plan görseli yüklendi:', updateData.background_image_url);
    } else if (req.body.existing_background_image_path) {
      // Mevcut arka plan görseli korunuyor, eğer tam yol ise sadece dosya adını al
      const existingBgPath = req.body.existing_background_image_path;
      if (existingBgPath.includes('/public/images/')) {
        // /public/images/ önekini kaldır
        updateData.background_image_url = existingBgPath.split('/public/images/').pop();
      } else if (existingBgPath.includes('/')) {
        // Başka bir yol formatı varsa en son / sonrasını al
        updateData.background_image_url = existingBgPath.split('/').pop();
      } else {
        // Zaten sadece dosya adı ise olduğu gibi kullan
        updateData.background_image_url = existingBgPath;
      }
      console.log('🖼️ Mevcut arka plan görseli korunuyor:', updateData.background_image_url);
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
    
    // Yeni alanları işle
    if (updateData.applicable_products) {
      try {
        updateData.applicable_products = typeof updateData.applicable_products === 'string' 
          ? JSON.parse(updateData.applicable_products) 
          : updateData.applicable_products;
      } catch (e) {
        console.error('Ürünler parse edilirken hata:', e);
        updateData.applicable_products = null;
      }
    }
    
    if (updateData.applicable_categories) {
      try {
        updateData.applicable_categories = typeof updateData.applicable_categories === 'string' 
          ? JSON.parse(updateData.applicable_categories) 
          : updateData.applicable_categories;
      } catch (e) {
        console.error('Kategoriler parse edilirken hata:', e);
        updateData.applicable_categories = null;
      }
    }
    
    // discount_type alanını kontrol et
    if (updateData.discount_type === 'undefined' || updateData.discount_type === '') {
      console.log('⚠️ discount_type undefined veya boş string olarak geldi, null yapılıyor');
      updateData.discount_type = null;
    }
    
    // Discount value'yu sayıya çevir
    if (updateData.discount_value !== undefined) {
      if (updateData.discount_value === '' || updateData.discount_value === 'undefined' || isNaN(parseFloat(updateData.discount_value))) {
        console.log('⚠️ discount_value geçersiz değer, null yapılıyor:', updateData.discount_value);
        updateData.discount_value = null;
      } else {
        updateData.discount_value = parseFloat(updateData.discount_value);
        console.log('✅ discount_value sayıya çevrildi:', updateData.discount_value);
      }
    }
    
    console.log('🔧 Güncellenecek veri:', updateData);
    
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
    
    // Eğer duyurunun resimleri varsa, resimleri de sil
    if (announcement.image_url) {
      const imagePath = `public/images/${announcement.image_url}`;
      deleteImage(imagePath);
    }
    
    if (announcement.background_image_url) {
      const backgroundImagePath = `public/images/${announcement.background_image_url}`;
      deleteImage(backgroundImagePath);
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

// Duyuru görselini getir
const getAnnouncementImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findByPk(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }
    
    // Görsel bilgilerini hazırla
    const imageData = {
      success: true,
      data: {
        image_url: announcement.image_url ? `/public/images/${announcement.image_url}` : null,
        background_image_url: announcement.background_image_url ? `/public/images/${announcement.background_image_url}` : null
      }
    };
    
    res.json(imageData);
  } catch (error) {
    console.error('Duyuru görseli getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Duyuru görseli getirilirken bir hata oluştu'
    });
  }
};

module.exports = {
  getAllAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  getAnnouncementImage,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  updateAnnouncementPriority,
  getAnnouncementsByCategory
};
