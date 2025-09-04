const { RecommendedProduct, Products, Category, sequelize } = require('../models');
const { Op } = require('sequelize');

// Bir ürünün yanında iyi gider ürünlerini getir
exports.getRecommendedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(`Ürün ID ${productId} için yanında iyi gider ürünleri getiriliyor...`);
    
    // Önce RecommendedProduct modelini kontrol edelim
    console.log('RecommendedProduct modeli:', RecommendedProduct);
    console.log('Products modeli:', Products);
    console.log('Category modeli:', Category);
    
    // İlişkileri kontrol edelim
    console.log('RecommendedProduct.associations:', Object.keys(RecommendedProduct.associations || {}));
    
    try {
      // Doğrudan SQL sorgusu kullanarak çakışmayı önle
      const recommendedProducts = await sequelize.query(`
        SELECT 
          rp.id, 
          rp.product_id, 
          rp.recommended_product_id, 
          rp.additional_price,
          p.product_name, 
          p.price, 
          p.image_url,
          c.category_id,
          c.category_name
        FROM 
          recommended_products rp
        JOIN 
          products p ON rp.recommended_product_id = p.product_id
        LEFT JOIN 
          categories c ON p.category_id = c.category_id
        WHERE 
          rp.product_id = :productId
      `, {
        replacements: { productId },
        type: sequelize.QueryTypes.SELECT
      });
      
      // Yanında iyi gider ürünlerini frontend'in beklediği formata dönüştür
      const formattedProducts = recommendedProducts.map(product => ({
        id: product.id,
        product_id: product.product_id,
        recommended_product_id: product.recommended_product_id,
        additional_price: product.additional_price,
        RecommendedProduct: {
          product_id: product.recommended_product_id,
          product_name: product.product_name,
          price: product.price,
          image_url: product.image_url,
          category: {
            category_id: product.category_id,
            category_name: product.category_name
          }
        }
      }));
      
      console.log(`Ürün ID ${productId} için ${recommendedProducts.length} adet yanında iyi gider ürünü bulundu.`);
      res.status(200).json(formattedProducts);
    } catch (queryError) {
      console.error('Sorgu hatası detayları:', queryError);
      console.error('Hata mesajı:', queryError.message);
      console.error('Hata stack:', queryError.stack);
      throw queryError; // Üst catch bloğuna ilet
    }
  } catch (error) {
    console.error('Yanında iyi gider ürünleri getirme hatası:', error);
    console.error('Hata mesajı:', error.message);
    console.error('Hata stack:', error.stack);
    res.status(500).json({ 
      message: 'Yanında iyi gider ürünleri getirilirken bir hata oluştu.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Bir ürüne yanında iyi gider ürün ekle
exports.addRecommendedProduct = async (req, res) => {
  try {
    const { product_id, recommended_product_id, additional_price } = req.body;
    
    // Ürünlerin var olup olmadığını kontrol et
    const mainProduct = await Products.findByPk(product_id);
    const recommendedProduct = await Products.findByPk(recommended_product_id);
    
    if (!mainProduct || !recommendedProduct) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    // Aynı tavsiye daha önce eklenmiş mi kontrol et
    const existingRecommendation = await RecommendedProduct.findOne({
      where: {
        product_id,
        recommended_product_id
      }
    });
    
    if (existingRecommendation) {
      // Varsa güncelle
      existingRecommendation.additional_price = additional_price || 0;
      await existingRecommendation.save();
      return res.status(200).json(existingRecommendation);
    }
    
    // Yeni tavsiye oluştur
    const newRecommendation = await RecommendedProduct.create({
      product_id,
      recommended_product_id,
      additional_price: additional_price || 0
    });
    
    res.status(201).json(newRecommendation);
  } catch (error) {
    console.error('Yanında iyi gider ürün ekleme hatası:', error);
    res.status(500).json({ message: 'Yanında iyi gider ürün eklenirken bir hata oluştu.' });
  }
};

// Birden fazla yanında iyi gider ürün ekle/güncelle
exports.bulkUpdateRecommendedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { recommendations } = req.body;
    
    if (!Array.isArray(recommendations)) {
      return res.status(400).json({ message: 'Geçersiz veri formatı. Tavsiye edilen ürünler bir dizi olmalıdır.' });
    }
    
    // Mevcut ürünün var olup olmadığını kontrol et
    const mainProduct = await Products.findByPk(productId);
    if (!mainProduct) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }
    
    // Mevcut tüm tavsiyeleri sil (temizle ve yeniden ekle yaklaşımı)
    await RecommendedProduct.destroy({
      where: { product_id: productId }
    });
    
    // Yeni tavsiyeleri ekle
    const newRecommendations = [];
    for (const rec of recommendations) {
      const newRec = await RecommendedProduct.create({
        product_id: productId,
        recommended_product_id: rec.recommended_product_id,
        additional_price: rec.additional_price || 0
      });
      newRecommendations.push(newRec);
    }
    
    res.status(200).json(newRecommendations);
  } catch (error) {
    console.error('Yanında iyi gider ürünleri toplu güncelleme hatası:', error);
    res.status(500).json({ message: 'Yanında iyi gider ürünleri güncellenirken bir hata oluştu.' });
  }
};

// Bir yanında iyi gider ürün ilişkisini sil
exports.removeRecommendedProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recommendation = await RecommendedProduct.findByPk(id);
    if (!recommendation) {
      return res.status(404).json({ message: 'Yanında iyi gider ürün ilişkisi bulunamadı' });
    }
    
    await recommendation.destroy();
    res.status(200).json({ message: 'Yanında iyi gider ürün ilişkisi başarıyla silindi' });
  } catch (error) {
    console.error('Yanında iyi gider ürün silme hatası:', error);
    res.status(500).json({ message: 'Yanında iyi gider ürün silinirken bir hata oluştu.' });
  }
};

// Kategori bazlı ürünleri getir (yanında iyi gider seçimi için)
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Kategori ve alt kategorileri bul
    let categoryIds = [categoryId];
    const subCategories = await Category.findAll({
      where: { parent_id: categoryId }
    });
    
    if (subCategories.length > 0) {
      const subCategoryIds = subCategories.map(cat => cat.category_id);
      categoryIds = [...categoryIds, ...subCategoryIds];
    }
    
    // Doğrudan SQL sorgusu kullanarak ürünleri getir
    const products = await sequelize.query(`
      SELECT 
        p.product_id, 
        p.product_name, 
        p.price, 
        p.image_url,
        c.category_id,
        c.category_name
      FROM 
        products p
      LEFT JOIN 
        categories c ON p.category_id = c.category_id
      WHERE 
        p.category_id IN (:categoryIds)
        AND p.is_active = true
    `, {
      replacements: { categoryIds },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Kategori ürünlerini frontend'in beklediği formata dönüştür
    const formattedProducts = products.map(product => ({
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      image_url: product.image_url,
      category: {
        category_id: product.category_id,
        category_name: product.category_name
      }
    }));
    
    console.log(`Kategori ID ${categoryId} için ${products.length} ürün bulundu.`);
    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Kategori bazlı ürün getirme hatası:', error);
    console.error('Hata mesajı:', error.message);
    console.error('Hata stack:', error.stack);
    res.status(500).json({ 
      message: 'Kategori bazlı ürünler getirilirken bir hata oluştu.',
      error: error.message 
    });
  }
};
