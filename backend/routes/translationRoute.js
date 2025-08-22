const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');
const { authenticateToken, checkPermission } = require('../middleware/authMiddleware');

// Public routes (QR menü için)
router.get('/products', translationController.getProductTranslations);
router.get('/categories', translationController.getCategoryTranslations);
router.get('/businesses', translationController.getBusinessTranslations);

// AI Translation routes
router.post('/translate', authenticateToken, checkPermission('manage_translations'), translationController.translateText);

// Test endpoint (geçici olarak)
router.post('/translate-test', translationController.translateTextTest);

// Admin routes
router.post('/products', authenticateToken, checkPermission('manage_translations'), translationController.upsertProductTranslation);
router.put('/products', authenticateToken, checkPermission('manage_translations'), translationController.upsertProductTranslation);
router.post('/categories', authenticateToken, checkPermission('manage_translations'), translationController.upsertCategoryTranslation);
router.put('/categories', authenticateToken, checkPermission('manage_translations'), translationController.upsertCategoryTranslation);
router.post('/businesses', authenticateToken, checkPermission('manage_translations'), translationController.upsertBusinessTranslation);
router.put('/businesses', authenticateToken, checkPermission('manage_translations'), translationController.upsertBusinessTranslation);
router.delete('/:type/:id', authenticateToken, checkPermission('manage_translations'), translationController.deleteTranslation);

module.exports = router;
