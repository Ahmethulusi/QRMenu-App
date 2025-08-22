const { 
  ProductTranslation, 
  CategoryTranslation, 
  BusinessTranslation,
  Products,
  Category,
  Business,
  Language
} = require('../models');

// Ürün çevirilerini getir
const getProductTranslations = async (req, res) => {
  try {
    const { product_id, language_code } = req.query;
    
    let whereClause = {};
    if (product_id) whereClause.product_id = product_id;
    if (language_code) whereClause.language_code = language_code;
    
    console.log('🔍 Çeviri arama kriterleri:', whereClause);
    
    const translations = await ProductTranslation.findAll({
      where: whereClause,
      include: [
        { 
          model: Language, 
          as: 'language', 
          attributes: ['code', 'name', 'native_name'],
          required: false
        }
      ],
      order: [['language_code', 'ASC']]
    });
    
    console.log('✅ Bulunan çeviriler:', translations.length);
    res.json(translations);
  } catch (error) {
    console.error('❌ Ürün çevirileri getirilirken hata:', error);
    res.status(500).json({ error: 'Ürün çevirileri getirilemedi', details: error.message });
  }
};

// Ürün çevirisi ekle/güncelle
const upsertProductTranslation = async (req, res) => {
  try {
    const { product_id, language_code, product_name, description, allergens } = req.body;
    
    if (!product_id || !language_code || !product_name) {
      return res.status(400).json({ error: 'Ürün ID, dil kodu ve ürün adı gerekli' });
    }
    
    // Ürün var mı kontrol et
    const product = await Products.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    // Dil var mı kontrol et
    const language = await Language.findOne({ where: { code: language_code, is_active: true } });
    if (!language) {
      return res.status(404).json({ error: 'Dil bulunamadı veya aktif değil' });
    }
    
    // Mevcut çeviri var mı kontrol et
    const existingTranslation = await ProductTranslation.findOne({
      where: { product_id, language_code }
    });
    
    let translation;
    if (existingTranslation) {
      // Güncelle
      translation = await existingTranslation.update({
        product_name,
        description,
        allergens
      });
    } else {
      // Yeni ekle
      translation = await ProductTranslation.create({
        product_id,
        language_code,
        product_name,
        description,
        allergens
      });
    }
    
    res.json(translation);
  } catch (error) {
    console.error('Ürün çevirisi eklenirken/güncellenirken hata:', error);
    res.status(500).json({ error: 'Ürün çevirisi eklenemedi/güncellenemedi' });
  }
};

// Kategori çevirilerini getir
const getCategoryTranslations = async (req, res) => {
  try {
    const { category_id, language_code } = req.query;
    
    let whereClause = {};
    if (category_id) whereClause.category_id = category_id;
    if (language_code) whereClause.language_code = language_code;
    
    const translations = await CategoryTranslation.findAll({
      where: whereClause,
      include: [
        { model: Language, as: 'language', attributes: ['code', 'name', 'native_name'] }
      ],
      order: [['language_code', 'ASC']]
    });
    
    res.json(translations);
  } catch (error) {
    console.error('Kategori çevirileri getirilirken hata:', error);
    res.status(500).json({ error: 'Kategori çevirileri getirilemedi' });
  }
};

// Kategori çevirisi ekle/güncelle
const upsertCategoryTranslation = async (req, res) => {
  try {
    const { category_id, language_code, category_name } = req.body;
    
    if (!category_id || !language_code || !category_name) {
      return res.status(400).json({ error: 'Kategori ID, dil kodu ve kategori adı gerekli' });
    }
    
    // Kategori var mı kontrol et
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    
    // Dil var mı kontrol et
    const language = await Language.findOne({ where: { code: language_code, is_active: true } });
    if (!language) {
      return res.status(404).json({ error: 'Dil bulunamadı veya aktif değil' });
    }
    
    // Mevcut çeviri var mı kontrol et
    const existingTranslation = await CategoryTranslation.findOne({
      where: { category_id, language_code }
    });
    
    let translation;
    if (existingTranslation) {
      // Güncelle
      translation = await existingTranslation.update({ category_name });
    } else {
      // Yeni ekle
      translation = await CategoryTranslation.create({
        category_id,
        language_code,
        category_name
      });
    }
    
    res.json(translation);
  } catch (error) {
    console.error('Kategori çevirisi eklenirken/güncellenirken hata:', error);
    res.status(500).json({ error: 'Kategori çevirisi eklenemedi/güncellenemedi' });
  }
};

// İşletme çevirilerini getir
const getBusinessTranslations = async (req, res) => {
  try {
    const { business_id, language_code } = req.query;
    
    let whereClause = {};
    if (business_id) whereClause.business_id = business_id;
    if (language_code) whereClause.language_code = language_code;
    
    const translations = await BusinessTranslation.findAll({
      where: whereClause,
      include: [
        { model: Language, as: 'language', attributes: ['code', 'name', 'native_name'] }
      ],
      order: [['language_code', 'ASC']]
    });
    
    res.json(translations);
  } catch (error) {
    console.error('İşletme çevirileri getirilirken hata:', error);
    res.status(500).json({ error: 'İşletme çevirileri getirilemedi' });
  }
};

// İşletme çevirisi ekle/güncelle
const upsertBusinessTranslation = async (req, res) => {
  try {
    const { business_id, language_code, name, description } = req.body;
    
    if (!business_id || !language_code || !name) {
      return res.status(400).json({ error: 'İşletme ID, dil kodu ve isim gerekli' });
    }
    
    // İşletme var mı kontrol et
    const business = await Business.findByPk(business_id);
    if (!business) {
      return res.status(404).json({ error: 'İşletme bulunamadı' });
    }
    
    // Dil var mı kontrol et
    const language = await Language.findOne({ where: { code: language_code, is_active: true } });
    if (!language) {
      return res.status(404).json({ error: 'Dil bulunamadı veya aktif değil' });
    }
    
    // Mevcut çeviri var mı kontrol et
    const existingTranslation = await BusinessTranslation.findOne({
      where: { business_id, language_code }
    });
    
    let translation;
    if (existingTranslation) {
      // Güncelle
      translation = await existingTranslation.update({ name, description });
    } else {
      // Yeni ekle
      translation = await BusinessTranslation.create({
        business_id,
        language_code,
        name,
        description
      });
    }
    
    res.json(translation);
  } catch (error) {
    console.error('İşletme çevirisi eklenirken/güncellenirken hata:', error);
    res.status(500).json({ error: 'İşletme çevirisi eklenemedi/güncellenemedi' });
  }
};

// Çeviri sil
const deleteTranslation = async (req, res) => {
  try {
    const { type, id } = req.params;
    
    let translation;
    switch (type) {
      case 'product':
        translation = await ProductTranslation.findByPk(id);
        break;
      case 'category':
        translation = await CategoryTranslation.findByPk(id);
        break;
      case 'business':
        translation = await BusinessTranslation.findByPk(id);
        break;
      default:
        return res.status(400).json({ error: 'Geçersiz çeviri tipi' });
    }
    
    if (!translation) {
      return res.status(404).json({ error: 'Çeviri bulunamadı' });
    }
    
    await translation.destroy();
    res.json({ message: 'Çeviri başarıyla silindi' });
  } catch (error) {
    console.error('Çeviri silinirken hata:', error);
    res.status(500).json({ error: 'Çeviri silinemedi' });
  }
};

module.exports = {
  getProductTranslations,
  upsertProductTranslation,
  getCategoryTranslations,
  upsertCategoryTranslation,
  getBusinessTranslations,
  upsertBusinessTranslation,
  deleteTranslation
};
