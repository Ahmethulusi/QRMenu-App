const express = require('express');
const router = express.Router();
const {
  getAllCurrencies,
  getActiveCurrencies,
  addCurrency,
  updateCurrency,
  deleteCurrency,
  updateExchangeRates,
  getAvailableCurrencies,
  convertPrice
} = require('../controllers/currencyController');

// Tüm para birimlerini getir
router.get('/', getAllCurrencies);

// Aktif para birimlerini getir
router.get('/active', getActiveCurrencies);

// Mevcut para birimlerini currencies.json API'sinden getir
router.get('/available', getAvailableCurrencies);

// Yeni para birimi ekle
router.post('/', addCurrency);

// Para birimi güncelle
router.put('/:id', updateCurrency);

// Para birimi sil
router.delete('/:id', deleteCurrency);

// Döviz kurlarını güncelle
router.post('/update-rates', updateExchangeRates);

// Fiyat dönüştürme
router.post('/convert', convertPrice);

module.exports = router;
