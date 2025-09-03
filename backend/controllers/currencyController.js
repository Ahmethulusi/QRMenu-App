const { Currency } = require('../models');
const fetch = require('node-fetch');

// Para birimi sembolleri ve isimleri
const CURRENCY_INFO = {
  'USD': { name: 'US Dollar', symbol: '$' },
  'EUR': { name: 'Euro', symbol: '€' },
  'GBP': { name: 'British Pound', symbol: '£' },
  'TRY': { name: 'Turkish Lira', symbol: '₺' },
  'JPY': { name: 'Japanese Yen', symbol: '¥' },
  'CAD': { name: 'Canadian Dollar', symbol: 'C$' },
  'AUD': { name: 'Australian Dollar', symbol: 'A$' },
  'CHF': { name: 'Swiss Franc', symbol: 'CHF' },
  'CNY': { name: 'Chinese Yuan', symbol: '¥' },
  'SEK': { name: 'Swedish Krona', symbol: 'kr' },
  'NOK': { name: 'Norwegian Krone', symbol: 'kr' },
  'DKK': { name: 'Danish Krone', symbol: 'kr' },
  'PLN': { name: 'Polish Zloty', symbol: 'zł' },
  'CZK': { name: 'Czech Koruna', symbol: 'Kč' },
  'HUF': { name: 'Hungarian Forint', symbol: 'Ft' },
  'RUB': { name: 'Russian Ruble', symbol: '₽' },
  'BRL': { name: 'Brazilian Real', symbol: 'R$' },
  'INR': { name: 'Indian Rupee', symbol: '₹' },
  'KRW': { name: 'South Korean Won', symbol: '₩' },
  'MXN': { name: 'Mexican Peso', symbol: '$' },
  'SGD': { name: 'Singapore Dollar', symbol: 'S$' },
  'HKD': { name: 'Hong Kong Dollar', symbol: 'HK$' },
  'NZD': { name: 'New Zealand Dollar', symbol: 'NZ$' },
  'ZAR': { name: 'South African Rand', symbol: 'R' },
  'THB': { name: 'Thai Baht', symbol: '฿' },
  'MYR': { name: 'Malaysian Ringgit', symbol: 'RM' },
  'PHP': { name: 'Philippine Peso', symbol: '₱' },
  'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp' },
  'AED': { name: 'UAE Dirham', symbol: 'د.إ' },
  'SAR': { name: 'Saudi Riyal', symbol: '﷼' },
  'QAR': { name: 'Qatari Riyal', symbol: '﷼' },
  'KWD': { name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  'BHD': { name: 'Bahraini Dinar', symbol: 'د.ب' },
  'OMR': { name: 'Omani Rial', symbol: '﷼' },
  'JOD': { name: 'Jordanian Dinar', symbol: 'د.ا' },
  'LBP': { name: 'Lebanese Pound', symbol: 'ل.ل' },
  'EGP': { name: 'Egyptian Pound', symbol: '£' },
  'ILS': { name: 'Israeli Shekel', symbol: '₪' },
  'RON': { name: 'Romanian Leu', symbol: 'lei' },
  'BGN': { name: 'Bulgarian Lev', symbol: 'лв' },
  'HRK': { name: 'Croatian Kuna', symbol: 'kn' },
  'RSD': { name: 'Serbian Dinar', symbol: 'дин' },
  'UAH': { name: 'Ukrainian Hryvnia', symbol: '₴' },
  'BYN': { name: 'Belarusian Ruble', symbol: 'Br' },
  'KZT': { name: 'Kazakhstani Tenge', symbol: '₸' },
  'UZS': { name: 'Uzbekistani Som', symbol: 'лв' },
  'GEL': { name: 'Georgian Lari', symbol: '₾' },
  'AMD': { name: 'Armenian Dram', symbol: '֏' },
  'AZN': { name: 'Azerbaijani Manat', symbol: '₼' },
  'TMT': { name: 'Turkmenistani Manat', symbol: 'T' },
  'TJS': { name: 'Tajikistani Somoni', symbol: 'SM' },
  'KGS': { name: 'Kyrgyzstani Som', symbol: 'лв' },
  'MNT': { name: 'Mongolian Tugrik', symbol: '₮' },
  'AFN': { name: 'Afghan Afghani', symbol: '؋' },
  'PKR': { name: 'Pakistani Rupee', symbol: '₨' },
  'LKR': { name: 'Sri Lankan Rupee', symbol: '₨' },
  'NPR': { name: 'Nepalese Rupee', symbol: '₨' },
  'BDT': { name: 'Bangladeshi Taka', symbol: '৳' },
  'BTN': { name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
  'MVR': { name: 'Maldivian Rufiyaa', symbol: 'Rf' },
  'MMK': { name: 'Myanmar Kyat', symbol: 'K' },
  'LAK': { name: 'Lao Kip', symbol: '₭' },
  'KHR': { name: 'Cambodian Riel', symbol: '៛' },
  'VND': { name: 'Vietnamese Dong', symbol: '₫' },
  'BND': { name: 'Brunei Dollar', symbol: 'B$' },
  'FJD': { name: 'Fijian Dollar', symbol: 'FJ$' },
  'PGK': { name: 'Papua New Guinea Kina', symbol: 'K' },
  'SBD': { name: 'Solomon Islands Dollar', symbol: 'SI$' },
  'VUV': { name: 'Vanuatu Vatu', symbol: 'Vt' },
  'WST': { name: 'Samoan Tala', symbol: 'WS$' },
  'TOP': { name: 'Tongan Paʻanga', symbol: 'T$' },
  'XPF': { name: 'CFP Franc', symbol: '₣' },
  'NIO': { name: 'Nicaraguan Córdoba', symbol: 'C$' },
  'GTQ': { name: 'Guatemalan Quetzal', symbol: 'Q' },
  'HNL': { name: 'Honduran Lempira', symbol: 'L' },
  'SVC': { name: 'Salvadoran Colón', symbol: '₡' },
  'BZD': { name: 'Belize Dollar', symbol: 'BZ$' },
  'JMD': { name: 'Jamaican Dollar', symbol: 'J$' },
  'TTD': { name: 'Trinidad and Tobago Dollar', symbol: 'TT$' },
  'BBD': { name: 'Barbadian Dollar', symbol: 'Bds$' },
  'XCD': { name: 'East Caribbean Dollar', symbol: '$' },
  'AWG': { name: 'Aruban Florin', symbol: 'ƒ' },
  'BMD': { name: 'Bermudian Dollar', symbol: '$' },
  'KYD': { name: 'Cayman Islands Dollar', symbol: '$' },
  'GYD': { name: 'Guyanese Dollar', symbol: 'G$' },
  'SRD': { name: 'Surinamese Dollar', symbol: '$' },
  'CLP': { name: 'Chilean Peso', symbol: '$' },
  'COP': { name: 'Colombian Peso', symbol: '$' },
  'PEN': { name: 'Peruvian Sol', symbol: 'S/' },
  'BOB': { name: 'Bolivian Boliviano', symbol: 'Bs' },
  'VES': { name: 'Venezuelan Bolívar', symbol: 'Bs.S' },
  'UYU': { name: 'Uruguayan Peso', symbol: '$U' },
  'PYG': { name: 'Paraguayan Guarani', symbol: '₲' },
  'ARS': { name: 'Argentine Peso', symbol: '$' },
  'DZD': { name: 'Algerian Dinar', symbol: 'د.ج' },
  'MAD': { name: 'Moroccan Dirham', symbol: 'د.م.' },
  'TND': { name: 'Tunisian Dinar', symbol: 'د.ت' },
  'LYD': { name: 'Libyan Dinar', symbol: 'ل.د' },
  'SDG': { name: 'Sudanese Pound', symbol: 'ج.س.' },
  'ETB': { name: 'Ethiopian Birr', symbol: 'Br' },
  'KES': { name: 'Kenyan Shilling', symbol: 'KSh' },
  'UGX': { name: 'Ugandan Shilling', symbol: 'USh' },
  'TZS': { name: 'Tanzanian Shilling', symbol: 'TSh' },
  'RWF': { name: 'Rwandan Franc', symbol: 'RF' },
  'BIF': { name: 'Burundian Franc', symbol: 'FBu' },
  'DJF': { name: 'Djiboutian Franc', symbol: 'Fdj' },
  'SOS': { name: 'Somali Shilling', symbol: 'S' },
  'ERN': { name: 'Eritrean Nakfa', symbol: 'Nfk' },
  'SSP': { name: 'South Sudanese Pound', symbol: '£' },
  'CDF': { name: 'Congolese Franc', symbol: 'FC' },
  'AOA': { name: 'Angolan Kwanza', symbol: 'Kz' },
  'ZMW': { name: 'Zambian Kwacha', symbol: 'ZK' },
  'BWP': { name: 'Botswana Pula', symbol: 'P' },
  'SZL': { name: 'Swazi Lilangeni', symbol: 'E' },
  'LSL': { name: 'Lesotho Loti', symbol: 'L' },
  'NAD': { name: 'Namibian Dollar', symbol: 'N$' },
  'MZN': { name: 'Mozambican Metical', symbol: 'MT' },
  'MWK': { name: 'Malawian Kwacha', symbol: 'MK' },
  'ZWL': { name: 'Zimbabwean Dollar', symbol: 'Z$' },
  'BND': { name: 'Brunei Dollar', symbol: 'B$' },
  'KHR': { name: 'Cambodian Riel', symbol: '៛' },
  'LAK': { name: 'Lao Kip', symbol: '₭' },
  'MMK': { name: 'Myanmar Kyat', symbol: 'K' },
  'MVR': { name: 'Maldivian Rufiyaa', symbol: 'Rf' },
  'NPR': { name: 'Nepalese Rupee', symbol: '₨' },
  'PKR': { name: 'Pakistani Rupee', symbol: '₨' },
  'LKR': { name: 'Sri Lankan Rupee', symbol: '₨' },
  'BDT': { name: 'Bangladeshi Taka', symbol: '৳' },
  'BTN': { name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
  'AFN': { name: 'Afghan Afghani', symbol: '؋' },
  'MNT': { name: 'Mongolian Tugrik', symbol: '₮' },
  'KGS': { name: 'Kyrgyzstani Som', symbol: 'лв' },
  'TJS': { name: 'Tajikistani Somoni', symbol: 'SM' },
  'TMT': { name: 'Turkmenistani Manat', symbol: 'T' },
  'AZN': { name: 'Azerbaijani Manat', symbol: '₼' },
  'AMD': { name: 'Armenian Dram', symbol: '֏' },
  'GEL': { name: 'Georgian Lari', symbol: '₾' },
  'UZS': { name: 'Uzbekistani Som', symbol: 'лв' },
  'KZT': { name: 'Kazakhstani Tenge', symbol: '₸' },
  'BYN': { name: 'Belarusian Ruble', symbol: 'Br' },
  'UAH': { name: 'Ukrainian Hryvnia', symbol: '₴' },
  'RSD': { name: 'Serbian Dinar', symbol: 'дин' },
  'HRK': { name: 'Croatian Kuna', symbol: 'kn' },
  'BGN': { name: 'Bulgarian Lev', symbol: 'лв' },
  'RON': { name: 'Romanian Leu', symbol: 'lei' },
  'ILS': { name: 'Israeli Shekel', symbol: '₪' },
  'EGP': { name: 'Egyptian Pound', symbol: '£' },
  'LBP': { name: 'Lebanese Pound', symbol: 'ل.ل' },
  'JOD': { name: 'Jordanian Dinar', symbol: 'د.ا' },
  'OMR': { name: 'Omani Rial', symbol: '﷼' },
  'BHD': { name: 'Bahraini Dinar', symbol: 'د.ب' },
  'KWD': { name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  'QAR': { name: 'Qatari Riyal', symbol: '﷼' },
  'SAR': { name: 'Saudi Riyal', symbol: '﷼' },
  'AED': { name: 'UAE Dirham', symbol: 'د.إ' },
  'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp' },
  'PHP': { name: 'Philippine Peso', symbol: '₱' },
  'MYR': { name: 'Malaysian Ringgit', symbol: 'RM' },
  'THB': { name: 'Thai Baht', symbol: '฿' },
  'VND': { name: 'Vietnamese Dong', symbol: '₫' },
  'KHR': { name: 'Cambodian Riel', symbol: '៛' },
  'LAK': { name: 'Lao Kip', symbol: '₭' },
  'MMK': { name: 'Myanmar Kyat', symbol: 'K' },
  'BND': { name: 'Brunei Dollar', symbol: 'B$' },
  'SGD': { name: 'Singapore Dollar', symbol: 'S$' },
  'HKD': { name: 'Hong Kong Dollar', symbol: 'HK$' },
  'KRW': { name: 'South Korean Won', symbol: '₩' },
  'JPY': { name: 'Japanese Yen', symbol: '¥' },
  'CNY': { name: 'Chinese Yuan', symbol: '¥' },
  'MOP': { name: 'Macanese Pataca', symbol: 'MOP$' },
  'TWD': { name: 'Taiwan New Dollar', symbol: 'NT$' },
  'NZD': { name: 'New Zealand Dollar', symbol: 'NZ$' },
  'AUD': { name: 'Australian Dollar', symbol: 'A$' },
  'FJD': { name: 'Fijian Dollar', symbol: 'FJ$' },
  'PGK': { name: 'Papua New Guinea Kina', symbol: 'K' },
  'SBD': { name: 'Solomon Islands Dollar', symbol: 'SI$' },
  'VUV': { name: 'Vanuatu Vatu', symbol: 'Vt' },
  'WST': { name: 'Samoan Tala', symbol: 'WS$' },
  'TOP': { name: 'Tongan Paʻanga', symbol: 'T$' },
  'XPF': { name: 'CFP Franc', symbol: '₣' },
  'NIO': { name: 'Nicaraguan Córdoba', symbol: 'C$' },
  'GTQ': { name: 'Guatemalan Quetzal', symbol: 'Q' },
  'HNL': { name: 'Honduran Lempira', symbol: 'L' },
  'SVC': { name: 'Salvadoran Colón', symbol: '₡' },
  'BZD': { name: 'Belize Dollar', symbol: 'BZ$' },
  'JMD': { name: 'Jamaican Dollar', symbol: 'J$' },
  'TTD': { name: 'Trinidad and Tobago Dollar', symbol: 'TT$' },
  'BBD': { name: 'Barbadian Dollar', symbol: 'Bds$' },
  'XCD': { name: 'East Caribbean Dollar', symbol: '$' },
  'AWG': { name: 'Aruban Florin', symbol: 'ƒ' },
  'BMD': { name: 'Bermudian Dollar', symbol: '$' },
  'KYD': { name: 'Cayman Islands Dollar', symbol: '$' },
  'GYD': { name: 'Guyanese Dollar', symbol: 'G$' },
  'SRD': { name: 'Surinamese Dollar', symbol: '$' },
  'CLP': { name: 'Chilean Peso', symbol: '$' },
  'COP': { name: 'Colombian Peso', symbol: '$' },
  'PEN': { name: 'Peruvian Sol', symbol: 'S/' },
  'BOB': { name: 'Bolivian Boliviano', symbol: 'Bs' },
  'VES': { name: 'Venezuelan Bolívar', symbol: 'Bs.S' },
  'UYU': { name: 'Uruguayan Peso', symbol: '$U' },
  'PYG': { name: 'Paraguayan Guarani', symbol: '₲' },
  'ARS': { name: 'Argentine Peso', symbol: '$' },
  'DZD': { name: 'Algerian Dinar', symbol: 'د.ج' },
  'MAD': { name: 'Moroccan Dirham', symbol: 'د.م.' },
  'TND': { name: 'Tunisian Dinar', symbol: 'د.ت' },
  'LYD': { name: 'Libyan Dinar', symbol: 'ل.د' },
  'SDG': { name: 'Sudanese Pound', symbol: 'ج.س.' },
  'ETB': { name: 'Ethiopian Birr', symbol: 'Br' },
  'KES': { name: 'Kenyan Shilling', symbol: 'KSh' },
  'UGX': { name: 'Ugandan Shilling', symbol: 'USh' },
  'TZS': { name: 'Tanzanian Shilling', symbol: 'TSh' },
  'RWF': { name: 'Rwandan Franc', symbol: 'RF' },
  'BIF': { name: 'Burundian Franc', symbol: 'FBu' },
  'DJF': { name: 'Djiboutian Franc', symbol: 'Fdj' },
  'SOS': { name: 'Somali Shilling', symbol: 'S' },
  'ERN': { name: 'Eritrean Nakfa', symbol: 'Nfk' },
  'SSP': { name: 'South Sudanese Pound', symbol: '£' },
  'CDF': { name: 'Congolese Franc', symbol: 'FC' },
  'AOA': { name: 'Angolan Kwanza', symbol: 'Kz' },
  'ZMW': { name: 'Zambian Kwacha', symbol: 'ZK' },
  'BWP': { name: 'Botswana Pula', symbol: 'P' },
  'SZL': { name: 'Swazi Lilangeni', symbol: 'E' },
  'LSL': { name: 'Lesotho Loti', symbol: 'L' },
  'NAD': { name: 'Namibian Dollar', symbol: 'N$' },
  'MZN': { name: 'Mozambican Metical', symbol: 'MT' },
  'MWK': { name: 'Malawian Kwacha', symbol: 'MK' },
  'ZWL': { name: 'Zimbabwean Dollar', symbol: 'Z$' }
};

// Tüm para birimlerini getir
const getAllCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.findAll({
      order: [['code', 'ASC']]
    });
    res.json(currencies);
  } catch (error) {
    console.error('Para birimleri getirme hatası:', error);
    res.status(500).json({ error: 'Para birimleri getirilemedi' });
  }
};

// Aktif para birimlerini getir
const getActiveCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.findAll({
      where: { is_active: true },
      order: [['code', 'ASC']]
    });
    res.json(currencies);
  } catch (error) {
    console.error('Aktif para birimleri getirme hatası:', error);
    res.status(500).json({ error: 'Aktif para birimleri getirilemedi' });
  }
};

// Yeni para birimi ekle
const addCurrency = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Para birimi kodu gerekli' });
    }

    const currencyInfo = CURRENCY_INFO[code.toUpperCase()];
    if (!currencyInfo) {
      return res.status(400).json({ error: 'Geçersiz para birimi kodu' });
    }

    // Para birimi zaten var mı kontrol et
    const existingCurrency = await Currency.findOne({ where: { code: code.toUpperCase() } });
    if (existingCurrency) {
      return res.status(400).json({ error: 'Bu para birimi zaten mevcut' });
    }

    // API'den güncel kur bilgisini çek
    let rate_to_usd = 1.0; // USD için varsayılan değer
    
    if (code.toUpperCase() !== 'USD') {
      try {
        const appId = process.env.EXCHANGE_APP_ID;
        if (appId) {
          const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${appId}`);
          if (response.ok) {
            const data = await response.json();
            const rates = data.rates;
            if (rates && rates[code.toUpperCase()]) {
              rate_to_usd = parseFloat(rates[code.toUpperCase()]);
            }
          }
        }
      } catch (apiError) {
        console.warn('API\'den kur alınamadı, varsayılan değer kullanılıyor:', apiError.message);
        // API'den kur alınamazsa varsayılan değerler kullan
        const defaultRates = {
          'EUR': 0.85,
          'GBP': 0.73,
          'TRY': 30.0,
          'JPY': 110.0
        };
        rate_to_usd = defaultRates[code.toUpperCase()] || 1.0;
      }
    }

    const currency = await Currency.create({
      name: currencyInfo.name,
      code: code.toUpperCase(),
      symbol: currencyInfo.symbol,
      rate_to_usd: rate_to_usd,
      last_updated: new Date()
    });

    res.status(201).json(currency);
  } catch (error) {
    console.error('Para birimi ekleme hatası:', error);
    res.status(500).json({ error: 'Para birimi eklenemedi' });
  }
};

// Para birimi güncelle
const updateCurrency = async (req, res) => {
  try {
    const { id } = req.params;
    const { rate_to_usd, is_active } = req.body;

    const currency = await Currency.findByPk(id);
    if (!currency) {
      return res.status(404).json({ error: 'Para birimi bulunamadı' });
    }

    const updateData = {};
    if (rate_to_usd !== undefined) {
      updateData.rate_to_usd = parseFloat(rate_to_usd);
      updateData.last_updated = new Date();
    }
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    await currency.update(updateData);
    res.json(currency);
  } catch (error) {
    console.error('Para birimi güncelleme hatası:', error);
    res.status(500).json({ error: 'Para birimi güncellenemedi' });
  }
};

// Para birimi sil
const deleteCurrency = async (req, res) => {
  try {
    const { id } = req.params;

    const currency = await Currency.findByPk(id);
    if (!currency) {
      return res.status(404).json({ error: 'Para birimi bulunamadı' });
    }

    await currency.destroy();
    res.json({ message: 'Para birimi silindi' });
  } catch (error) {
    console.error('Para birimi silme hatası:', error);
    res.status(500).json({ error: 'Para birimi silinemedi' });
  }
};

// Open Exchange Rates API'den kurları güncelle
const updateExchangeRates = async (req, res) => {
  try {
    const appId = process.env.EXCHANGE_APP_ID;
    if (!appId) {
      return res.status(500).json({ error: 'EXCHANGE_APP_ID environment variable bulunamadı' });
    }

    const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${appId}`);
    
    if (!response.ok) {
      throw new Error(`API isteği başarısız: ${response.status}`);
    }

    const data = await response.json();
    const rates = data.rates;

    if (!rates) {
      throw new Error('API\'den kurlar alınamadı');
    }

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

    res.json({ 
      message: `${updatedCount} para birimi kuru güncellendi`,
      last_updated: new Date(),
      total_currencies: currencies.length
    });
  } catch (error) {
    console.error('Döviz kurları güncelleme hatası:', error);
    res.status(500).json({ error: 'Döviz kurları güncellenemedi: ' + error.message });
  }
};

// Mevcut para birimlerini currencies.json API'sinden getir
const getAvailableCurrencies = async (req, res) => {
  try {
    const response = await fetch('https://openexchangerates.org/api/currencies.json');
    
    if (!response.ok) {
      throw new Error(`API isteği başarısız: ${response.status}`);
    }

    const currencies = await response.json();
    
    // Mevcut para birimlerini al
    const existingCurrencies = await Currency.findAll({
      attributes: ['code']
    });
    const existingCodes = existingCurrencies.map(c => c.code);

    // Mevcut olmayan para birimlerini filtrele
    const availableCurrencies = Object.entries(currencies)
      .filter(([code]) => !existingCodes.includes(code))
      .map(([code, name]) => ({
        code,
        name,
        symbol: CURRENCY_INFO[code]?.symbol || code,
        rate_to_usd: 1.0 // Varsayılan değer
      }));

    res.json(availableCurrencies);
  } catch (error) {
    console.error('Mevcut para birimleri getirme hatası:', error);
    res.status(500).json({ error: 'Mevcut para birimleri getirilemedi: ' + error.message });
  }
};

// Fiyat dönüştürme
const convertPrice = async (req, res) => {
  try {
    const { amount, from_currency, to_currency } = req.body;

    if (!amount || !from_currency || !to_currency) {
      return res.status(400).json({ error: 'Miktar, kaynak ve hedef para birimi gerekli' });
    }

    const fromCurr = await Currency.findOne({ where: { code: from_currency.toUpperCase() } });
    const toCurr = await Currency.findOne({ where: { code: to_currency.toUpperCase() } });

    if (!fromCurr || !toCurr) {
      return res.status(404).json({ error: 'Para birimi bulunamadı' });
    }

    // USD üzerinden dönüştürme
    const amountInUSD = parseFloat(amount) * fromCurr.rate_to_usd;
    const convertedAmount = amountInUSD / toCurr.rate_to_usd;

    res.json({
      original_amount: parseFloat(amount),
      original_currency: from_currency.toUpperCase(),
      converted_amount: convertedAmount,
      target_currency: to_currency.toUpperCase(),
      exchange_rate: fromCurr.rate_to_usd / toCurr.rate_to_usd,
      last_updated: fromCurr.last_updated
    });
  } catch (error) {
    console.error('Fiyat dönüştürme hatası:', error);
    res.status(500).json({ error: 'Fiyat dönüştürülemedi' });
  }
};

module.exports = {
  getAllCurrencies,
  getActiveCurrencies,
  addCurrency,
  updateCurrency,
  deleteCurrency,
  updateExchangeRates,
  getAvailableCurrencies,
  convertPrice
};
