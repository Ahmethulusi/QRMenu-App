const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const { authenticateToken } = require('../middleware/authMiddleware'); // Geçici olarak kaldırıldı

// Tüm kullanıcıları getir - geçici olarak yetki kontrolü kaldırıldı
router.get('/', userController.getAllUsers);

// Yeni kullanıcı oluştur - geçici olarak yetki kontrolü kaldırıldı
router.post('/', userController.createUser);

// Kullanıcı güncelle - geçici olarak yetki kontrolü kaldırıldı
router.put('/:user_id', userController.updateUser);

// Kullanıcı sil - geçici olarak yetki kontrolü kaldırıldı
router.delete('/:user_id', userController.deleteUser);

// Kullanıcı şifresini güncelle - geçici olarak yetki kontrolü kaldırıldı
router.put('/:user_id/password', userController.updatePassword);

module.exports = router;