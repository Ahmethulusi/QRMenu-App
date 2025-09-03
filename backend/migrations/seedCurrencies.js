const { Currency } = require('../models');

const defaultCurrencies = [
  {
    name: 'US Dollar',
    code: 'USD',
    symbol: '$',
    rate_to_usd: 1.0,
    is_active: true,
    last_updated: new Date()
  },
  {
    name: 'Euro',
    code: 'EUR',
    symbol: '€',
    rate_to_usd: 0.85, // Varsayılan değer, API'den güncellenecek
    is_active: true,
    last_updated: new Date()
  },
  {
    name: 'British Pound',
    code: 'GBP',
    symbol: '£',
    rate_to_usd: 0.73, // Varsayılan değer, API'den güncellenecek
    is_active: true,
    last_updated: new Date()
  },
  {
    name: 'Turkish Lira',
    code: 'TRY',
    symbol: '₺',
    rate_to_usd: 30.0, // Varsayılan değer, API'den güncellenecek
    is_active: true,
    last_updated: new Date()
  },
  {
    name: 'Japanese Yen',
    code: 'JPY',
    symbol: '¥',
    rate_to_usd: 110.0, // Varsayılan değer, API'den güncellenecek
    is_active: true,
    last_updated: new Date()
  }
];

const seedCurrencies = async () => {
  try {
    console.log('🌱 Varsayılan para birimleri ekleniyor...');

    for (const currencyData of defaultCurrencies) {
      const existingCurrency = await Currency.findOne({ 
        where: { code: currencyData.code } 
      });

      if (!existingCurrency) {
        await Currency.create(currencyData);
        console.log(`✅ ${currencyData.name} (${currencyData.code}) eklendi`);
      } else {
        console.log(`⚠️ ${currencyData.name} (${currencyData.code}) zaten mevcut`);
      }
    }

    console.log('✅ Varsayılan para birimleri işlemi tamamlandı');
  } catch (error) {
    console.error('❌ Para birimleri ekleme hatası:', error);
  }
};

// Eğer bu dosya doğrudan çalıştırılıyorsa
if (require.main === module) {
  seedCurrencies().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Seed işlemi başarısız:', error);
    process.exit(1);
  });
}

module.exports = { seedCurrencies };
