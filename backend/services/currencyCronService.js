const cron = require('node-cron');
const { updateExchangeRates } = require('../controllers/currencyController');

// Döviz kurlarını güncelleme fonksiyonu
const updateRates = async () => {
  try {
    console.log('🔄 Döviz kurları güncelleniyor...');
    
    const appId = process.env.EXCHANGE_APP_ID;
    if (!appId) {
      console.error('❌ EXCHANGE_APP_ID environment variable bulunamadı');
      return;
    }

    const fetch = require('node-fetch');
    const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${appId}`);
    
    if (!response.ok) {
      throw new Error(`API isteği başarısız: ${response.status}`);
    }

    const data = await response.json();
    const rates = data.rates;

    if (!rates) {
      throw new Error('API\'den kurlar alınamadı');
    }

    const { Currency } = require('../models');
    
    // Mevcut para birimlerini güncelle
    const currencies = await Currency.findAll();
    let updatedCount = 0;

    for (const currency of currencies) {
      const rate = rates[currency.code];
      if (rate && rate !== currency.rate_to_usd) {
        await currency.update({
          rate_to_usd: parseFloat(rate),
          last_updated: new Date()
        });
        updatedCount++;
      }
    }

    console.log(`✅ ${updatedCount} para birimi kuru güncellendi (${new Date().toLocaleString()})`);
  } catch (error) {
    console.error('❌ Döviz kurları güncelleme hatası:', error.message);
  }
};

// Cron job'ları başlat
const startCurrencyCronJobs = () => {
  console.log('🚀 Para birimi cron job\'ları başlatılıyor...');

  // Her 6 saatte bir kurları güncelle (günde 4 kez)
  cron.schedule('0 */6 * * *', () => {
    console.log('⏰ 6 saatlik döviz kuru güncelleme zamanı geldi');
    updateRates();
  }, {
    scheduled: true,
    timezone: "Europe/Istanbul"
  });

  console.log('✅ Para birimi cron job\'ları başlatıldı');
};

module.exports = {
  startCurrencyCronJobs,
  updateRates
};