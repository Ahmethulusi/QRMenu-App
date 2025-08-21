const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadFields } = require('../middleware/uploadMiddleware');

// Çoklu dosya yükleme için fields kullan
const announcementUpload = uploadFields('announcement', [
  { name: 'image', maxCount: 1 },
  { name: 'background_image', maxCount: 1 }
]);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Duyurular route çalışıyor!' });
});

// Tüm duyuruları getir (admin için)
router.get('/all', authenticateToken, announcementController.getAllAnnouncements);

// Aktif duyuruları getir (public endpoint)
router.get('/active', announcementController.getActiveAnnouncements);

// ID'ye göre duyuru getir
router.get('/:id', announcementController.getAnnouncementById);

// ID'ye göre duyuru görselini getir
router.get('/:id/image', announcementController.getAnnouncementImage);

// Kategoriye göre duyuruları getir
router.get('/category/:category', announcementController.getAnnouncementsByCategory);

// Yeni duyuru oluştur (admin için) - dosya yükleme ile
router.post('/', authenticateToken, announcementUpload, announcementController.createAnnouncement);

// Duyuru güncelle (admin için) - dosya yükleme ile
router.put('/:id', authenticateToken, announcementUpload, announcementController.updateAnnouncement);

// Duyuru sil (admin için)
router.delete('/:id', authenticateToken, announcementController.deleteAnnouncement);

// Duyuru durumunu değiştir (admin için)
router.patch('/:id/toggle-status', authenticateToken, announcementController.toggleAnnouncementStatus);

// Duyuru önceliğini güncelle (admin için)
router.patch('/:id/priority', authenticateToken, announcementController.updateAnnouncementPriority);

module.exports = router;
