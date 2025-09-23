const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { validateProductId, validateCategoryId, validateAnnouncementId } = require('../middleware/validation');
const announcementController = require('../controllers/announcementController');

/**
 * Aktif duyuruları getir
 * GET /api/announcements
 * 
 * Query params:
 * - type: promotion, campaign, discount, general
 * - category: visual_only, visual_text, subscription_form, text_image_button, newsletter_form, countdown_timer, countdown_image
 * - limit: sayı (varsayılan: 50)
 */
router.get('/', asyncHandler(announcementController.getActiveAnnouncements));

/**
 * Promosyon duyurularını getir
 * GET /api/announcements/promotions
 * 
 * İndirim ve promosyon duyurularını getirir
 */
router.get('/promotions', asyncHandler(announcementController.getPromotions));

/**
 * Kampanya duyurularını getir
 * GET /api/announcements/campaigns
 * 
 * Kampanya duyurularını getirir
 */
router.get('/campaigns', asyncHandler(announcementController.getCampaigns));

/**
 * Countdown timer'lı duyuruları getir
 * GET /api/announcements/countdown
 * 
 * Geri sayım özellikli duyuruları getirir
 */
router.get('/countdown', asyncHandler(announcementController.getCountdownAnnouncements));

/**
 * Belirli ürün için duyuruları getir
 * GET /api/announcements/product/:productId
 * 
 * Belirli bir ürüne uygulanabilir duyuruları getirir
 */
router.get('/product/:productId', validateProductId, asyncHandler(announcementController.getAnnouncementsByProduct));

/**
 * Belirli kategori için duyuruları getir
 * GET /api/announcements/category/:categoryId
 * 
 * Belirli bir kategoriye uygulanabilir duyuruları getirir
 */
router.get('/category/:categoryId', validateCategoryId, asyncHandler(announcementController.getAnnouncementsByProduct));

/**
 * Belirli duyuru detayını getir
 * GET /api/announcements/:id
 * 
 * ID'si belirtilen duyurunun detaylarını getirir
 */
router.get('/:id', validateAnnouncementId, asyncHandler(announcementController.getAnnouncementById));

module.exports = router;
