const { Currency, Language } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * Currency Controller
 * Para birimi işlemlerini yöneten controller
 */
class CurrencyController {

  /**
   * Tüm aktif para birimlerini getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAllCurrencies = async (req, res) => {
    const currencies = await Currency.findAll({
      where: { is_active: true },
      order: [['code', 'ASC']],
      attributes: ['id', 'name', 'code', 'symbol', 'rate_to_usd', 'last_updated']
    });

    res.json({
      success: true,
      data: {
        currencies: currencies.map(currency => ({
          id: currency.id,
          name: currency.name,
          code: currency.code,
          symbol: currency.symbol,
          rate_to_usd: parseFloat(currency.rate_to_usd),
          last_updated: currency.last_updated
        })),
        total: currencies.length,
        base_currency: 'USD'
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Belirli para birimini kod ile getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getCurrencyByCode = async (req, res) => {
    const { code } = req.params;
    
    const currency = await Currency.findOne({
      where: { 
        code: code.toUpperCase(),
        is_active: true 
      },
      attributes: ['id', 'name', 'code', 'symbol', 'rate_to_usd', 'last_updated'],
      include: [
        {
          model: Language,
          as: 'languages',
          where: { is_active: true },
          required: false,
          attributes: ['code', 'name', 'native_name']
        }
      ]
    });

    if (!currency) {
      throw new AppError(`Para birimi '${code}' bulunamadı`, 404, 'CURRENCY_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        id: currency.id,
        name: currency.name,
        code: currency.code,
        symbol: currency.symbol,
        rate_to_usd: parseFloat(currency.rate_to_usd),
        last_updated: currency.last_updated,
        supported_languages: currency.languages ? currency.languages.map(lang => ({
          code: lang.code,
          name: lang.name,
          native_name: lang.native_name
        })) : []
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Para birimi çevirimi hesapla
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  convertCurrency = async (req, res) => {
    const { fromCode, toCode, amount } = req.params;
    
    // Miktar kontrolü
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      throw new AppError('Geçersiz miktar', 400, 'INVALID_AMOUNT');
    }

    // Para birimlerini getir
    const fromCurrency = await Currency.findOne({
      where: { code: fromCode.toUpperCase(), is_active: true },
      attributes: ['code', 'symbol', 'rate_to_usd']
    });

    const toCurrency = await Currency.findOne({
      where: { code: toCode.toUpperCase(), is_active: true },
      attributes: ['code', 'symbol', 'rate_to_usd']
    });

    if (!fromCurrency) {
      throw new AppError(`Kaynak para birimi '${fromCode}' bulunamadı`, 404, 'FROM_CURRENCY_NOT_FOUND');
    }

    if (!toCurrency) {
      throw new AppError(`Hedef para birimi '${toCode}' bulunamadı`, 404, 'TO_CURRENCY_NOT_FOUND');
    }

    // Çevrim hesaplama
    // 1. fromCode'dan USD'ye çevir
    const usdAmount = numAmount / parseFloat(fromCurrency.rate_to_usd);
    
    // 2. USD'den toCode'a çevir
    const convertedAmount = usdAmount * parseFloat(toCurrency.rate_to_usd);

    res.json({
      success: true,
      data: {
        from: {
          amount: numAmount,
          currency: fromCurrency.code,
          symbol: fromCurrency.symbol
        },
        to: {
          amount: parseFloat(convertedAmount.toFixed(6)),
          currency: toCurrency.code,
          symbol: toCurrency.symbol
        },
        exchange_rate: parseFloat((parseFloat(toCurrency.rate_to_usd) / parseFloat(fromCurrency.rate_to_usd)).toFixed(6)),
        base_currency: 'USD',
        calculation: {
          step1: `${numAmount} ${fromCurrency.code} = ${parseFloat(usdAmount.toFixed(6))} USD`,
          step2: `${parseFloat(usdAmount.toFixed(6))} USD = ${parseFloat(convertedAmount.toFixed(6))} ${toCurrency.code}`
        }
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new CurrencyController();
