const { Product, Category, Branch, ProductTranslation, CategoryTranslation, Label, Currency, Language } = require('../models');

/**
 * Menu Controller
 * Menü işlemlerini yöneten controller
 */
class MenuController {

  /**
   * Çeviri helper fonksiyonu
   * @param {Object} item - Çevrilecek item
   * @param {string} lang - Dil kodu
   * @param {string} originalField - Orijinal alan adı
   * @param {string} translationField - Çeviri alan adı
   */
  _getTranslatedText(item, lang, originalField, translationField) {
    if (item.translations && item.translations[0]) {
      return item.translations[0][translationField];
    }
    return item[originalField];
  }

  /**
   * Ürün çevirilerini işle
   * @param {Object} product - Ürün object
   * @param {string} lang - Dil kodu
   */
  _mapProductWithTranslations(product, lang) {
    const productTranslation = product.translations && product.translations[0];
    
    return {
      id: product.product_id,
      name: productTranslation ? productTranslation.product_name : product.product_name,
      description: productTranslation ? productTranslation.description : product.description,
      price: product.price,
      currency: product.currency_code,
      image_url: product.image_url,
      order: product.sira_id,
      nutritional_info: {
        calories: product.calorie_count,
        carbs: product.carbs,
        protein: product.protein,
        fat: product.fat,
        allergens: productTranslation ? productTranslation.allergens : product.allergens
      },
      cooking_time: product.cooking_time,
      stock: product.stock,
      is_available: product.is_available,
      
      // Etiketler
      labels: product.labels ? product.labels.map(label => ({
        id: label.label_id,
        name: label.name,
        description: label.description,
        color: label.color
      })) : []
    };
  }

  /**
   * Kategori çevirilerini işle
   * @param {Object} category - Kategori object
   * @param {string} lang - Dil kodu
   */
  _mapCategoryWithTranslations(category, lang) {
    const categoryTranslation = category.translations && category.translations[0];
    
    return {
      id: category.category_id,
      name: categoryTranslation ? categoryTranslation.category_name : category.category_name,
      image_url: category.image_url,
      order: category.sira_id,
      products: category.products ? 
        category.products.map(product => this._mapProductWithTranslations(product, lang)) : []
    };
  }

  /**
   * Şube menüsünü getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getBranchMenu = async (req, res) => {
    const { branchId } = req.params;
    const { lang = 'tr', category } = req.query;

    // Şube var mı kontrol et
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Şube bulunamadı',
        code: 'BRANCH_NOT_FOUND'
      });
    }

    // Dil bilgisi ve currency bilgisini getir
    const language = await Language.findOne({
      where: { code: lang, is_active: true },
      include: [
        {
          model: Currency,
          as: 'defaultCurrency',
          where: { is_active: true },
          required: false,
          attributes: ['code', 'symbol', 'rate_to_usd', 'name']
        }
      ]
    });

    // Kategorileri getir (çoklu dil desteği ile)
    let categoryFilter = { business_id: branch.business_id, is_active: true };
    if (category) {
      categoryFilter.category_id = category;
    }

    const categories = await Category.findAll({
      where: categoryFilter,
      order: [['sira_id', 'ASC']],
      include: [
        {
          model: CategoryTranslation,
          as: 'translations',
          where: { language_code: lang },
          required: false,
          attributes: ['category_name']
        },
        {
          model: Product,
          as: 'products',
          where: { 
            is_active: true,
            is_available: true
          },
          order: [['sira_id', 'ASC']],
          required: false,
          include: [
            {
              model: ProductTranslation,
              as: 'translations',
              where: { language_code: lang },
              required: false,
              attributes: ['product_name', 'description', 'allergens']
            },
            {
              model: Label,
              as: 'labels',
              where: { is_active: true },
              required: false,
              attributes: ['label_id', 'name', 'description', 'color'],
              through: { attributes: [] } // ProductLabel ara tablosundan veri almaya gerek yok
            }
          ]
        }
      ]
    });

    // Response formatı
    const menuData = {
      success: true,
      data: {
        branch: {
          id: branch.id,
          name: branch.name,
          address: branch.adress
        },
        language: lang,
        currency: language?.defaultCurrency ? {
          code: language.defaultCurrency.code,
          symbol: language.defaultCurrency.symbol,
          name: language.defaultCurrency.name,
          rate_to_usd: parseFloat(language.defaultCurrency.rate_to_usd)
        } : {
          code: 'USD',
          symbol: '$',
          name: 'US Dollar',
          rate_to_usd: 1.0
        },
        categories: categories.map(cat => this._mapCategoryWithTranslations(cat, lang)),
        timestamp: new Date().toISOString()
      }
    };

    res.json(menuData);
  }

  /**
   * Sadece kategorileri getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getBranchCategories = async (req, res) => {
    const { branchId } = req.params;
    const { lang = 'tr' } = req.query;

    // Şube var mı kontrol et
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Şube bulunamadı'
      });
    }

    const categories = await Category.findAll({
      where: { 
        business_id: branch.business_id,
        is_active: true 
      },
      order: [['sira_id', 'ASC']],
      attributes: ['category_id', 'category_name', 'image_url', 'sira_id'],
      include: [
        {
          model: CategoryTranslation,
          as: 'translations',
          where: { language_code: lang },
          required: false,
          attributes: ['category_name']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        branch_id: branchId,
        language: lang,
        categories: categories.map(cat => {
          const categoryTranslation = cat.translations && cat.translations[0];
          return {
            id: cat.category_id,
            name: categoryTranslation ? categoryTranslation.category_name : cat.category_name,
            image_url: cat.image_url,
            order: cat.sira_id
          };
        })
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Belirli bir kategorideki ürünleri getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getCategoryProducts = async (req, res) => {
    const { branchId, categoryId } = req.params;
    const { lang = 'tr' } = req.query;

    // Şube kontrolü
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Şube bulunamadı'
      });
    }

    const category = await Category.findOne({
      where: {
        category_id: categoryId,
        business_id: branch.business_id,
        is_active: true
      },
      include: [
        {
          model: CategoryTranslation,
          as: 'translations',
          where: { language_code: lang },
          required: false,
          attributes: ['category_name']
        },
        {
          model: Product,
          as: 'products',
          where: { 
            is_active: true,
            is_available: true
          },
          order: [['sira_id', 'ASC']],
          required: false,
          include: [
            {
              model: ProductTranslation,
              as: 'translations',
              where: { language_code: lang },
              required: false,
              attributes: ['product_name', 'description', 'allergens']
            },
            {
              model: Label,
              as: 'labels',
              where: { is_active: true },
              required: false,
              attributes: ['label_id', 'name', 'description', 'color'],
              through: { attributes: [] } // ProductLabel ara tablosundan veri almaya gerek yok
            }
          ]
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı'
      });
    }

    res.json({
      success: true,
      data: {
        branch_id: branchId,
        language: lang,
        category: {
          id: category.category_id,
          name: category.translations && category.translations[0] ? 
                category.translations[0].category_name : category.category_name,
          image_url: category.image_url,
          products: category.products ? 
            category.products.map(product => this._mapProductWithTranslations(product, lang)) : []
        }
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new MenuController();
