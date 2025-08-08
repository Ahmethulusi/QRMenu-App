const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Yetki kontrolü
router.post('/check', authenticateToken, permissionController.checkPermission);

// Kullanıcı yetkilerini getir
router.get('/user', authenticateToken, permissionController.getUserPermissions);

// Yetki yönetimi (sadece super_admin)
router.put('/update', authenticateToken, permissionController.updateRolePermissions);

// Tüm yetkileri listele
router.get('/all', authenticateToken, permissionController.getAllPermissions);

// Rol yetkilerini listele
router.get('/role/:role', authenticateToken, permissionController.getRolePermissions);

// Test endpoint'i
router.post('/test', permissionController.testPermission);

// Debug endpoint'i
router.put('/test-update', authenticateToken, permissionController.testUpdate);

module.exports = router; 