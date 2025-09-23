const { Product, Category, Portion, Ingredient, RecommendedProduct, ProductTranslation, CategoryTranslation, Label } = require('../models');

/**
 * Product Controller
 * Ürün işlemlerini yöneten controller
 */
class ProductController {

  /**
   * Ürün detaylarını getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getProductDetails = async (req, res) => {
    const { productId } = req.params;
    const { lang = 'tr', business_id } = req.query;

    // Business ID kontrolü
    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: 'business_id parametresi gereklidir',
        code: 'BUSINESS_ID_REQUIRED'
      });
    }

    // Ürünü detaylarıyla birlikte getir
    const product = await Product.findOne({
      where: {
        product_id: productId,
        business_id: parseInt(business_id),
        is_active: true,
        is_available: true
      },
      include: [
        {
          model: ProductTranslation,
          as: 'translations',
          where: { language_code: lang },
          required: false,
          attributes: ['product_name', 'description', 'allergens']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'category_name', 'image_url'],
          include: [
            {
              model: CategoryTranslation,
              as: 'translations',
              where: { language_code: lang },
              required: false,
              attributes: ['category_name']
            }
          ]
        },
        {
          model: Portion,
          as: 'portions',
          attributes: ['portion_id', 'name', 'price'],
          required: false
        },
        {
          model: Ingredient,
          as: 'ingredients',
          attributes: ['ingredient_id', 'name', 'type'],
          required: false
        },
        {
          model: Label,
          as: 'labels',
          where: { is_active: true },
          required: false,
          attributes: ['label_id', 'name', 'description', 'color'],
          through: { attributes: [] }
        },
        {
          model: RecommendedProduct,
          as: 'recommendedProducts',
          include: [
            {
              model: Product,
              as: 'recommendedProduct',
              attributes: ['product_id', 'product_name', 'price', 'currency_code', 'image_url'],
              where: { is_active: true, is_available: true },
              required: false
            }
          ],
          required: false
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı veya mevcut değil',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Çevirileri kullan
    const productTranslation = product.translations && product.translations[0];
    const productName = productTranslation ? productTranslation.product_name : product.product_name;
    const productDescription = productTranslation ? productTranslation.description : product.description;
    const productAllergens = productTranslation ? productTranslation.allergens : product.allergens;
    
    const categoryTranslation = product.category && product.category.translations && product.category.translations[0];
    const categoryName = categoryTranslation ? categoryTranslation.category_name : 
                        (product.category ? product.category.category_name : null);

    // Response formatı
    const productData = {
      success: true,
      data: {
        id: product.product_id,
        name: productName,
        description: productDescription,
        price: product.price,
        currency: product.currency_code,
        image_url: product.image_url,
        order: product.sira_id,
        
        // Kategori bilgisi
        category: product.category ? {
          id: product.category.category_id,
          name: categoryName,
          image_url: product.category.image_url
        } : null,
        
        // Beslenme bilgileri
        nutritional_info: {
          calories: product.calorie_count,
          carbs: product.carbs,
          protein: product.protein,
          fat: product.fat,
          allergens: productAllergens
        },
        
        // Diğer bilgiler
        cooking_time: product.cooking_time,
        stock: product.stock,
        is_available: product.is_available,
        
        // Porsiyonlar
        portions: product.portions ? product.portions.map(portion => ({
          id: portion.portion_id,
          name: portion.name,
          price: portion.price
        })) : [],
        
        // Malzemeler
        ingredients: product.ingredients ? product.ingredients.map(ingredient => ({
          id: ingredient.ingredient_id,
          name: ingredient.name,
          type: ingredient.type
        })) : [],
        
        // Etiketler
        labels: product.labels ? product.labels.map(label => ({
          id: label.label_id,
          name: label.name,
          description: label.description,
          color: label.color
        })) : [],
        
        // Önerilen ürünler
        recommended_products: product.recommendedProducts ? 
          product.recommendedProducts
            .filter(rp => rp.recommendedProduct) // Null olanları filtrele
            .map(rp => ({
              id: rp.recommendedProduct.product_id,
              name: rp.recommendedProduct.product_name,
              price: rp.recommendedProduct.price,
              currency: rp.recommendedProduct.currency_code,
              image_url: rp.recommendedProduct.image_url
            })) : [],
        
        language: lang,
        timestamp: new Date().toISOString()
      }
    };

    res.json(productData);
  }

  /**
   * Ürün alerjen bilgilerini getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getProductAllergens = async (req, res) => {
    const { productId } = req.params;
    const { business_id } = req.query;

    // Business ID kontrolü
    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: 'business_id parametresi gereklidir',
        code: 'BUSINESS_ID_REQUIRED'
      });
    }

    const product = await Product.findOne({
      where: {
        product_id: productId,
        business_id: parseInt(business_id),
        is_active: true
      },
      include: [
        {
          model: Ingredient,
          as: 'ingredients',
          attributes: ['ingredient_id', 'name', 'type'],
          required: false
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    const allergens = {
      product_id: product.product_id,
      product_name: product.product_name,
      allergen_info: product.allergens,
      ingredients: product.ingredients ? product.ingredients.map(ingredient => ({
        id: ingredient.ingredient_id,
        name: ingredient.name,
        type: ingredient.type
      })) : []
    };

    res.json({
      success: true,
      data: allergens,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Ürün beslenme bilgilerini getir
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getProductNutrition = async (req, res) => {
    const { productId } = req.params;
    const { business_id } = req.query;

    // Business ID kontrolü
    if (!business_id) {
      return res.status(400).json({
        success: false,
        message: 'business_id parametresi gereklidir',
        code: 'BUSINESS_ID_REQUIRED'
      });
    }

    const product = await Product.findOne({
      where: {
        product_id: productId,
        business_id: parseInt(business_id),
        is_active: true
      },
      attributes: [
        'product_id', 'product_name', 'calorie_count', 
        'carbs', 'protein', 'fat', 'allergens'
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
    }

    const nutritionData = {
      product_id: product.product_id,
      product_name: product.product_name,
      nutrition: {
        calories: product.calorie_count || 0,
        carbohydrates: product.carbs || 0,
        protein: product.protein || 0,
        fat: product.fat || 0,
        allergens: product.allergens
      }
    };

    res.json({
      success: true,
      data: nutritionData,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new ProductController();
