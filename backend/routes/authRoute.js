const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Kullanıcı kayıt
router.post('/register', authController.register);

// Kullanıcı girişi
router.post('/login', authController.login);

// Mevcut kullanıcı bilgilerini al
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;