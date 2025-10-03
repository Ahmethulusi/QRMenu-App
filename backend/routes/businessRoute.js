const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadSingleToCloudflare, uploadMultipleToCloudflare } = require('../middleware/uploadMiddleware');

// Apply auth middleware to all routes
router.use(authenticateToken);

// Get business profile
router.get('/profile', businessController.getBusinessProfile);

// Update business profile
router.put('/profile', businessController.updateBusinessProfile);

// Upload logo (single file)
router.post('/upload-logo', uploadSingleToCloudflare('business_logo', 'logo'), businessController.uploadLogo);

// Upload banner images (multiple files)
router.post('/upload-banners', uploadMultipleToCloudflare('business_banner', 'banners', 5), businessController.uploadBannerImages);

// Upload welcome background (single file)
router.post('/upload-welcome-background', uploadSingleToCloudflare('welcome_background', 'welcome_background'), businessController.uploadWelcomeBackground);

// Delete logo
router.delete('/logo', businessController.deleteLogo);

// Delete banner image
router.delete('/banner-image', businessController.deleteBannerImage);

// Delete welcome background
router.delete('/welcome-background', businessController.deleteWelcomeBackground);

module.exports = router;
