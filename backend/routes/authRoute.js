const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Login
router.post('/login', authController.login);

// Mevcut kullanıcı bilgisi
router.get('/me', authenticateToken, authController.getCurrentUser);

// Logout
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;