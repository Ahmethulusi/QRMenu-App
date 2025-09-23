const { Announcement, Product, Category } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');

/**
 * Announcement Controller
 * Duyuru işlemlerini yöneten controller (Read-Only)
 */
class AnnouncementController {

  /**
   * Aktif duyuruları getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getActiveAnnouncements = async (req, res) => {
    const { type, category, limit = 50, debug = false, business_id } = req.query;
    const currentDate = new Date();
    
    // Business ID kontrolü
    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: 'business_id parametresi gereklidir',
        code: 'BUSINESS_ID_REQUIRED'
      });
    }
    
    // Debug mode - sadece aktif kontrol et
    if (debug === 'true') {
      const announcements = await Announcement.findAll({
        where: { 
          is_active: true,
          business_id: parseInt(business_id)
        },
        order: [['priority', 'DESC'], ['created_at', 'DESC']],
        limit: parseInt(limit)
      });
      
      return res.json({
        success: true,
        debug_mode: true,
        data: {
          announcements: announcements.map(announcement => this._formatAnnouncement(announcement)),
          total: announcements.length,
          query_used: { is_active: true, business_id: parseInt(business_id) }
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Normal mode - tarih kontrolleri ile
    let whereConditions = {
      is_active: true,
      business_id: parseInt(business_id),
      [Op.and]: [
        {
          [Op.or]: [
            { start_date: null },
            { start_date: { [Op.lte]: currentDate } }
          ]
        },
        {
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: currentDate } }
          ]
        }
      ]
    };

    // Type filtresi
    if (type && ['promotion', 'campaign', 'discount', 'general'].includes(type)) {
      whereConditions.type = type;
    }

    // Category filtresi
    if (category && ['visual_only', 'visual_text', 'subscription_form', 'text_image_button', 'newsletter_form', 'countdown_timer', 'countdown_image'].includes(category)) {
      whereConditions.category = category;
    }

    const announcements = await Announcement.findAll({
      where: whereConditions,
      order: [['priority', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      attributes: [
        'id', 'title', 'content', 'image_url', 'type', 'category', 
        'priority', 'start_date', 'end_date', 'discount_type', 
        'discount_value', 'applicable_products', 'applicable_categories',
        'campaign_condition', 'campaign_reward', 'delay', 'button_text',
        'button_color', 'button_url', 'background_image_url', 
        'countdown_date', 'layout_config', 'created_at'
      ]
    });
    
    res.json({
      success: true,
      data: {
        announcements: announcements.map(announcement => this._formatAnnouncement(announcement)),
        total: announcements.length,
        filters: {
          type: type || 'all',
          category: category || 'all',
          limit: parseInt(limit)
        }
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Belirli ID'ye göre duyuru getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAnnouncementById = async (req, res) => {
    const { id } = req.params;
    
    const announcement = await Announcement.findOne({
      where: { 
        id: id,
        is_active: true 
      },
      attributes: [
        'id', 'title', 'content', 'image_url', 'type', 'category', 
        'priority', 'start_date', 'end_date', 'discount_type', 
        'discount_value', 'applicable_products', 'applicable_categories',
        'campaign_condition', 'campaign_reward', 'delay', 'button_text',
        'button_color', 'button_url', 'background_image_url', 
        'countdown_date', 'layout_config', 'created_at'
      ]
    });

    if (!announcement) {
      throw new AppError('Duyuru bulunamadı', 404, 'ANNOUNCEMENT_NOT_FOUND');
    }

    res.json({
      success: true,
      data: this._formatAnnouncement(announcement),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Promosyon duyurularını getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getPromotions = async (req, res) => {
    const { limit = 20 } = req.query;
    const currentDate = new Date();
    
    const promotions = await Announcement.findAll({
      where: {
        type: 'promotion',
        is_active: true,
        [Op.and]: [
          {
            [Op.or]: [
              { start_date: null },
              { start_date: { [Op.lte]: currentDate } }
            ]
          },
          {
            [Op.or]: [
              { end_date: null },
              { end_date: { [Op.gte]: currentDate } }
            ]
          }
        ]
      },
      order: [['priority', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      attributes: [
        'id', 'title', 'content', 'image_url', 'type', 'discount_type', 
        'discount_value', 'applicable_products', 'applicable_categories',
        'button_text', 'button_color', 'button_url', 'background_image_url', 
        'start_date', 'end_date', 'created_at'
      ]
    });
    
    res.json({
      success: true,
      data: {
        promotions: promotions.map(promo => this._formatAnnouncement(promo)),
        total: promotions.length
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Kampanya duyurularını getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getCampaigns = async (req, res) => {
    const { limit = 20, business_id } = req.query;
    const currentDate = new Date();
    
    // Business ID kontrolü
    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: 'business_id parametresi gereklidir',
        code: 'BUSINESS_ID_REQUIRED'
      });
    }
    
    const campaigns = await Announcement.findAll({
      where: {
        type: 'campaign',
        is_active: true,
        business_id: parseInt(business_id),
        [Op.and]: [
          {
            [Op.or]: [
              { start_date: null },
              { start_date: { [Op.lte]: currentDate } }
            ]
          },
          {
            [Op.or]: [
              { end_date: null },
              { end_date: { [Op.gte]: currentDate } }
            ]
          }
        ]
      },
      order: [['priority', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      attributes: [
        'id', 'title', 'content', 'image_url', 'type', 'campaign_condition',
        'campaign_reward', 'button_text', 'button_color', 'button_url', 
        'background_image_url', 'start_date', 'end_date', 'created_at'
      ]
    });
    
    res.json({
      success: true,
      data: {
        campaigns: campaigns.map(campaign => this._formatAnnouncement(campaign)),
        total: campaigns.length
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Ürün/kategori bazlı duyuruları getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAnnouncementsByProduct = async (req, res) => {
    const { productId, categoryId } = req.params;
    const { limit = 10 } = req.query;
    const currentDate = new Date();
    
    let whereConditions = {
      is_active: true,
      [Op.and]: [
        {
          [Op.or]: [
            { start_date: null },
            { start_date: { [Op.lte]: currentDate } }
          ]
        },
        {
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: currentDate } }
          ]
        }
      ]
    };

    // Ürün veya kategori filtresi - whereConditions'a ek olarak ekle
    if (productId) {
      whereConditions[Op.and].push({
        [Op.or]: [
          {
            applicable_products: {
              [Op.contains]: [parseInt(productId)]
            }
          },
          {
            applicable_products: null
          }
        ]
      });
    } else if (categoryId) {
      whereConditions[Op.and].push({
        [Op.or]: [
          {
            applicable_categories: {
              [Op.contains]: [parseInt(categoryId)]
            }
          },
          {
            applicable_categories: null
          }
        ]
      });
    }

    const announcements = await Announcement.findAll({
      where: whereConditions,
      order: [['priority', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      attributes: [
        'id', 'title', 'content', 'image_url', 'type', 'discount_type', 
        'discount_value', 'applicable_products', 'applicable_categories',
        'campaign_condition', 'campaign_reward', 'button_text', 'button_color', 
        'button_url', 'start_date', 'end_date'
      ]
    });
    
    res.json({
      success: true,
      data: {
        announcements: announcements.map(announcement => this._formatAnnouncement(announcement)),
        product_id: productId || null,
        category_id: categoryId || null,
        total: announcements.length
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Countdown timer'lı duyuruları getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getCountdownAnnouncements = async (req, res) => {
    const { limit = 5 } = req.query;
    const currentDate = new Date();
    
    const countdownAnnouncements = await Announcement.findAll({
      where: {
        category: 'countdown_timer',
        is_active: true,
        countdown_date: {
          [Op.gte]: currentDate // Sadece gelecekteki countdown'lar
        }
      },
      order: [['countdown_date', 'ASC'], ['priority', 'DESC']],
      limit: parseInt(limit),
      attributes: [
        'id', 'title', 'content', 'image_url', 'countdown_date',
        'button_text', 'button_color', 'button_url', 'background_image_url',
        'layout_config'
      ]
    });
    
    res.json({
      success: true,
      data: {
        countdown_announcements: countdownAnnouncements.map(announcement => {
          const formatted = this._formatAnnouncement(announcement);
          // Kalan süreyi hesapla
          formatted.time_remaining = {
            total_seconds: Math.floor((new Date(announcement.countdown_date) - currentDate) / 1000),
            formatted: this._formatTimeRemaining(announcement.countdown_date)
          };
          return formatted;
        }),
        total: countdownAnnouncements.length
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Announcement formatla
   * @param {Object} announcement - Announcement object
   * @private
   */
  _formatAnnouncement(announcement) {
    return {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      image_url: announcement.image_url,
      background_image_url: announcement.background_image_url,
      type: announcement.type,
      category: announcement.category,
      priority: announcement.priority,
      
      // Discount bilgileri
      discount: announcement.discount_type ? {
        type: announcement.discount_type,
        value: parseFloat(announcement.discount_value) || 0,
        applicable_products: announcement.applicable_products || [],
        applicable_categories: announcement.applicable_categories || []
      } : null,
      
      // Campaign bilgileri
      campaign: announcement.type === 'campaign' ? {
        condition: announcement.campaign_condition,
        reward: announcement.campaign_reward
      } : null,
      
      // UI bilgileri
      ui: {
        delay: announcement.delay,
        button: announcement.button_text ? {
          text: announcement.button_text,
          color: announcement.button_color,
          url: announcement.button_url
        } : null,
        countdown_date: announcement.countdown_date,
        layout_config: announcement.layout_config
      },
      
      // Tarih bilgileri
      period: {
        start_date: announcement.start_date,
        end_date: announcement.end_date,
        is_active: this._isAnnouncementActive(announcement)
      },
      
      created_at: announcement.created_at
    };
  }

  /**
   * Duyurunun şu anda aktif olup olmadığını kontrol et
   * @param {Object} announcement - Announcement object
   * @private
   */
  _isAnnouncementActive(announcement) {
    const now = new Date();
    const startDate = announcement.start_date ? new Date(announcement.start_date) : null;
    const endDate = announcement.end_date ? new Date(announcement.end_date) : null;
    
    const isAfterStart = !startDate || now >= startDate;
    const isBeforeEnd = !endDate || now <= endDate;
    
    return isAfterStart && isBeforeEnd;
  }

  /**
   * Kalan süreyi formatla
   * @param {Date} countdownDate - Countdown tarihi
   * @private
   */
  _formatTimeRemaining(countdownDate) {
    const now = new Date();
    const target = new Date(countdownDate);
    const diff = target - now;
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  }
}

module.exports = new AnnouncementController();
