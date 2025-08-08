const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Tüm kullanıcıları getir
router.get('/', userController.getAllUsers);

// Yeni kullanıcı oluştur
router.post('/', userController.createUser);

// Kullanıcı güncelle
router.put('/:user_id', userController.updateUser);

// Kullanıcı sil
router.delete('/:user_id', userController.deleteUser);

// Kullanıcı şifresini güncelle
router.put('/:user_id/password', userController.updatePassword);

module.exports = router;