const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const currencyController = require('../controllers/currencyController');

/**
 * Aktif para birimlerini listele
 * GET /api/currencies
 * 
 * Tüm aktif para birimlerini ve güncel kurlarını döndürür
 */
router.get('/', asyncHandler(currencyController.getAllCurrencies));

/**
 * Belirli para birimini getir
 * GET /api/currencies/:code
 * 
 * Belirli bir para biriminin detaylarını döndürür
 */
router.get('/:code', asyncHandler(currencyController.getCurrencyByCode));

/**
 * Exchange rate hesaplama
 * GET /api/currencies/convert/:fromCode/:toCode/:amount
 * 
 * Para birimi çevrimini hesaplar
 */
router.get('/convert/:fromCode/:toCode/:amount', asyncHandler(currencyController.convertCurrency));

module.exports = router;
