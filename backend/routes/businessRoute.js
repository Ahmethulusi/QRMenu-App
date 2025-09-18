const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createUploadMiddleware } = require('../middleware/uploadMiddleware');

// Apply auth middleware to all routes
router.use(authenticateToken);

// Get business profile
router.get('/profile', businessController.getBusinessProfile);

// Update business profile
router.put('/profile', businessController.updateBusinessProfile);

// Upload logo (single file)
router.post('/upload-logo', createUploadMiddleware('business_logo').single('logo'), businessController.uploadLogo);

// Upload banner images (multiple files)
router.post('/upload-banners', createUploadMiddleware('business_banner').array('banners', 5), businessController.uploadBannerImages);

// Delete logo
router.delete('/logo', businessController.deleteLogo);

// Delete banner image
router.delete('/banner-image', businessController.deleteBannerImage);

module.exports = router;
