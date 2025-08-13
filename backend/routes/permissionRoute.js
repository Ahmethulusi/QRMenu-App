const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hasPermission } = require('../controllers/permissionController');

// Yetki kontrolü
router.post('/check', authenticateToken, permissionController.checkPermission);

// Kullanıcı yetkilerini getir
router.get('/user', authenticateToken, permissionController.getUserPermissions);

// Yetki güncelleme
router.put('/update', 
  authenticateToken, 
  hasPermission('permissions', 'update'), 
  permissionController.updateRolePermissions
);

// Tüm yetkileri listele
router.get('/all', 
  authenticateToken, 
  hasPermission('system', 'settings'), 
  permissionController.getAllPermissions
);

// Rol yetkilerini listele
router.get('/role/:role', 
  authenticateToken, 
  hasPermission('permissions', 'read'), 
  permissionController.getRolePermissions
);

// Test endpoint'i
router.post('/test', permissionController.testPermission);

// Debug endpoint'i
router.put('/test-update', 
  authenticateToken, 
  hasPermission('system', 'settings'), 
  permissionController.testUpdate
);

module.exports = router; 