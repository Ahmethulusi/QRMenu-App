const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hasPermission } = require('../controllers/permissionController');

// Tüm kullanıcıları getir
router.get('/', 
  authenticateToken, 
  hasPermission('users', 'read'), 
  userController.getAllUsers
);

// Yeni kullanıcı oluştur
router.post('/', 
  authenticateToken, 
  hasPermission('users', 'create'), 
  userController.createUser
);

// Kullanıcı güncelle
router.put('/:user_id', 
  authenticateToken, 
  hasPermission('users', 'update'), 
  userController.updateUser
);

// Kullanıcı sil
router.delete('/:user_id', 
  authenticateToken, 
  hasPermission('users', 'delete'), 
  userController.deleteUser
);

// Kullanıcı şifresini güncelle
router.put('/:user_id/password', 
  authenticateToken, 
  hasPermission('users', 'update'), 
  userController.updatePassword
);

module.exports = router;