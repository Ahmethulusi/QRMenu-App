const { Language, Currency } = require('../models');

/**
 * Language Controller
 * Dil işlemlerini yöneten controller
 */
class LanguageController {

  /**
   * Mevcut dilleri listele
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getLanguages = async (req, res) => {
    const languages = await Language.findAll({
      where: {
        is_active: true
      },
      attributes: [
        'id', 'code', 'name', 'native_name', 
        'is_default', 'direction', 'default_currency_code'
      ],
      include: [
        {
          model: Currency,
          as: 'defaultCurrency',
          where: { is_active: true },
          required: false,
          attributes: ['code', 'symbol', 'rate_to_usd', 'name']
        }
      ],
      order: [
        ['is_default', 'DESC'], // Varsayılan dil önce
        ['name', 'ASC']         // Sonra alfabetik sıra
      ]
    });

    // Response formatı
    const responseData = {
      success: true,
      data: {
        languages: languages.map(lang => ({
          id: lang.id,
          code: lang.code,
          name: lang.name,
          native_name: lang.native_name,
          is_default: lang.is_default,
          direction: lang.direction,
          currency_code: lang.default_currency_code,
          default_currency: lang.defaultCurrency ? {
            code: lang.defaultCurrency.code,
            symbol: lang.defaultCurrency.symbol,
            name: lang.defaultCurrency.name,
            rate_to_usd: parseFloat(lang.defaultCurrency.rate_to_usd)
          } : null
        })),
        default_language: languages.find(lang => lang.is_default)?.code || 'tr',
        total_count: languages.length
      },
      timestamp: new Date().toISOString()
    };

    res.json(responseData);
  }

  /**
   * Belirli bir dil bilgilerini getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getLanguageByCode = async (req, res) => {
    const { langCode } = req.params;

    // Dil kodunu küçük harfe çevir
    const normalizedLangCode = langCode.toLowerCase();

    const language = await Language.findOne({
      where: {
        code: normalizedLangCode,
        is_active: true
      },
      attributes: [
        'id', 'code', 'name', 'native_name', 
        'is_default', 'direction', 'default_currency_code'
      ]
    });

    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Dil bulunamadı veya aktif değil',
        code: 'LANGUAGE_NOT_FOUND'
      });
    }

    const responseData = {
      success: true,
      data: {
        id: language.id,
        code: language.code,
        name: language.name,
        native_name: language.native_name,
        is_default: language.is_default,
        direction: language.direction,
        currency_code: language.default_currency_code
      },
      timestamp: new Date().toISOString()
    };

    res.json(responseData);
  }

  /**
   * RTL dilleri listele (Sağdan sola yazılan diller)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getRTLLanguages = async (req, res) => {
    const rtlLanguages = await Language.findAll({
      where: {
        direction: 'rtl',
        is_active: true
      },
      attributes: ['code', 'name', 'native_name'],
      order: [['name', 'ASC']]
    });

    const responseData = {
      success: true,
      data: {
        rtl_languages: rtlLanguages.map(lang => ({
          code: lang.code,
          name: lang.name,
          native_name: lang.native_name
        })),
        count: rtlLanguages.length
      },
      timestamp: new Date().toISOString()
    };

    res.json(responseData);
  }

  /**
   * Dil doğrulama
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  validateLanguage = async (req, res) => {
    const { langCode } = req.body;

    if (!langCode) {
      return res.status(400).json({
        success: false,
        message: 'Dil kodu belirtilmelidir',
        code: 'LANG_CODE_REQUIRED'
      });
    }

    const normalizedLangCode = langCode.toLowerCase();

    // Dil mevcut mu kontrol et
    const language = await Language.findOne({
      where: {
        code: normalizedLangCode,
        is_active: true
      }
    });

    const isValid = !!language;

    const responseData = {
      success: true,
      data: {
        lang_code: normalizedLangCode,
        is_valid: isValid,
        is_active: isValid,
        language_info: isValid ? {
          id: language.id,
          code: language.code,
          name: language.name,
          native_name: language.native_name,
          direction: language.direction
        } : null
      },
      timestamp: new Date().toISOString()
    };

    res.json(responseData);
  }
}

module.exports = new LanguageController();
