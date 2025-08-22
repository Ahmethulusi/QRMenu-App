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

// Test fonksiyonu (geçici olarak)
const translateTextTest = async (req, res) => {
  try {
    console.log('🧪 Test çeviri isteği alındı');
    console.log('Request body:', req.body);
    
    const { texts, sourceLang, targetLang } = req.body;
    
    if (!texts || !Array.isArray(texts) || !targetLang) {
      return res.status(400).json({ error: 'Çevrilecek metinler ve hedef dil gerekli' });
    }
    
    console.log('📝 Çevrilecek metinler:', texts);
    console.log('🌍 Kaynak dil:', sourceLang);
    console.log('🎯 Hedef dil:', targetLang);
    
    // Eğer aynı dil ise çeviri yapmaya gerek yok
    if (sourceLang === targetLang) {
      console.log('✅ Aynı dil, çeviri yapılmadı');
      return res.json({ 
        translations: texts.map(text => ({ originalText: text, translatedText: text })),
        method: 'same-language'
      });
    }
    
    // translate paketini kullanarak AI çevirisi
    console.log('🔄 translate paketi yükleniyor...');
    const translate = require('translate');
    
    console.log('⚙️ Çeviri ayarları yapılıyor...');
    // Çeviri ayarları
    translate.engine = 'google'; // Google Translate (ücretsiz)
    translate.from = sourceLang || 'tr';
    translate.to = targetLang;
    
    console.log('🚀 Çeviri başlıyor...');
    // Tüm metinleri çevir
    const translations = [];
    
    for (const text of texts) {
      try {
        if (text && text.trim()) {
          console.log(`🔄 "${text}" çevriliyor...`);
          const translatedText = await translate(text);
          console.log(`✅ "${text}" -> "${translatedText}"`);
          translations.push({
            originalText: text,
            translatedText: translatedText || text
          });
        } else {
          translations.push({
            originalText: text,
            translatedText: text
          });
        }
      } catch (translateError) {
        console.warn(`❌ Çeviri hatası (${text}):`, translateError);
        // Hata durumunda orijinal metni kullan
        translations.push({
          originalText: text,
          translatedText: text
        });
      }
    }
    
    console.log('🎉 Çeviri tamamlandı:', translations);
    res.json({ 
      translations, 
      method: 'ai-translate',
      sourceLang,
      targetLang
    });
    
  } catch (error) {
    console.error('❌ AI çeviri hatası:', error);
    
    // Fallback: Basit prefix ekleme
    const translations = texts.map(text => ({
      originalText: text,
      translatedText: `[${targetLang.toUpperCase()}] ${text}`
    }));
    
    res.json({ translations, fallback: true, error: error.message });
  }
};

// AI ile çeviri yap (Ücretsiz AI çeviri)
const translateText = async (req, res) => {
  try {
    const { texts, sourceLang, targetLang } = req.body;
    
    if (!texts || !Array.isArray(texts) || !targetLang) {
      return res.status(400).json({ error: 'Çevrilecek metinler ve hedef dil gerekli' });
    }
    
    // Eğer aynı dil ise çeviri yapmaya gerek yok
    if (sourceLang === targetLang) {
      return res.json({ 
        translations: texts.map(text => ({ originalText: text, translatedText: text }))
      });
    }
    
    // translate paketini kullanarak AI çevirisi
    const translate = require('translate');
    
    // Çeviri ayarları
    translate.engine = 'google'; // Google Translate (ücretsiz)
    translate.from = sourceLang || 'tr';
    translate.to = targetLang;
    
    // Tüm metinleri çevir
    const translations = [];
    
    for (const text of texts) {
      try {
        if (text && text.trim()) {
          const translatedText = await translate(text);
          translations.push({
            originalText: text,
            translatedText: translatedText || text
          });
        } else {
          translations.push({
            originalText: text,
            translatedText: text
          });
        }
      } catch (translateError) {
        console.warn(`Çeviri hatası (${text}):`, translateError);
        // Hata durumunda orijinal metni kullan
        translations.push({
          originalText: text,
          translatedText: text
        });
      }
    }
    
    res.json({ 
      translations, 
      method: 'ai-translate',
      sourceLang,
      targetLang
    });
    
  } catch (error) {
    console.error('AI çeviri hatası:', error);
    
    // Fallback: Basit prefix ekleme
    const translations = texts.map(text => ({
      originalText: text,
      translatedText: `[${targetLang.toUpperCase()}] ${text}`
    }));
    
    res.json({ translations, fallback: true, error: error.message });
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
  deleteTranslation,
  translateText,
  translateTextTest
};
