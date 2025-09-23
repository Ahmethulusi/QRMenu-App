const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequestBody } = require('../middleware/validation');
const languageController = require('../controllers/languageController');

/**
 * Mevcut dilleri listele
 * GET /api/languages
 * 
 * Response: Aktif dillerin listesi
 */
router.get('/', asyncHandler(languageController.getLanguages));

/**
 * RTL dilleri listele (Sağdan sola yazılan diller)
 * GET /api/languages/rtl
 */
router.get('/rtl', asyncHandler(languageController.getRTLLanguages));

/**
 * Dil doğrulama endpoint'i
 * POST /api/languages/validate
 * 
 * Body:
 * - langCode: Kontrol edilecek dil kodu
 */
router.post('/validate', 
  validateRequestBody, 
  asyncHandler(languageController.validateLanguage)
);

/**
 * Belirli bir dil bilgilerini getir
 * GET /api/languages/:langCode
 * 
 * Params:
 * - langCode: Dil kodu (tr, en, de, fr, ar)
 */
router.get('/:langCode', asyncHandler(languageController.getLanguageByCode));

module.exports = router;