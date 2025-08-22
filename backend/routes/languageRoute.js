const express = require('express');
const router = express.Router();
const languageController = require('../controllers/languageController');
const { authenticateToken, checkPermission } = require('../middleware/authMiddleware');

// Public routes (QR menü için)
router.get('/all', languageController.getAllLanguages);
router.get('/default', languageController.getDefaultLanguage);

// Admin routes
router.post('/add', authenticateToken, checkPermission('manage_languages'), languageController.addLanguage);
router.put('/update/:id', authenticateToken, checkPermission('manage_languages'), languageController.updateLanguage);
router.put('/set-default/:id', authenticateToken, checkPermission('manage_languages'), languageController.setDefaultLanguage);
router.delete('/delete/:id', authenticateToken, checkPermission('manage_languages'), languageController.deleteLanguage);

module.exports = router;
