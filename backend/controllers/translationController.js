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
    
    console.log('Ürün model adı:', Products.name);
    console.log('Ürün tableName:', Products.tableName);
    
    // Dil var mı kontrol et
    const language = await Language.findOne({ where: { code: language_code, is_active: true } });
    if (!language) {
      return res.status(404).json({ error: 'Dil bulunamadı veya aktif değil' });
    }
    
    // Ürünün business_id'sini al
    const business_id = product.business_id;
    console.log('Ürün business_id:', business_id, 'Ürün:', JSON.stringify(product));
    
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
        allergens,
        business_id
      });
    } else {
      // Yeni ekle
      translation = await ProductTranslation.create({
        product_id,
        language_code,
        product_name,
        description,
        allergens,
        business_id
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
    
    // Kategorinin business_id'sini al
    const business_id = category.business_id;
    console.log('Kategori business_id:', business_id, 'Kategori:', JSON.stringify(category));
    
    // Mevcut çeviri var mı kontrol et
    const existingTranslation = await CategoryTranslation.findOne({
      where: { category_id, language_code }
    });
    
    let translation;
    if (existingTranslation) {
      // Güncelle
      translation = await existingTranslation.update({ 
        category_name,
        business_id 
      });
    } else {
      // Yeni ekle
      translation = await CategoryTranslation.create({
        category_id,
        language_code,
        category_name,
        business_id
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

// DeepL API Test endpoint
const testDeepLAPI = async (req, res) => {
  try {
    console.log('🧪 DeepL API test başlatılıyor...');
    console.log('📝 Request method:', req.method);
    console.log('📋 Request body:', req.body);
    
    // DeepL API key kontrolü
    const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
    
    if (!DEEPL_API_KEY) {
      return res.status(500).json({ 
        error: 'DeepL API key bulunamadı', 
        message: 'Lütfen .env dosyasına DEEPL_API_KEY ekleyin' 
      });
    }
    
    console.log('🔑 API Key var, test çevirisi yapılıyor...');
    
    // Test parametrelerini al (POST'ta body'den, GET'te default)
    let testText, targetLang, sourceLang;
    
    if (req.method === 'POST' && req.body) {
      // POST request - body'den parametreleri al
      testText = req.body.text || 'Merhaba';
      targetLang = req.body.targetLang || 'EN';
      sourceLang = req.body.sourceLang || 'TR';
    } else {
      // GET request - default değerler
      testText = 'Merhaba';
      targetLang = 'EN';
      sourceLang = 'TR';
    }
    
    console.log('🎯 Test parametreleri:', { testText, sourceLang, targetLang });
    
    const deeplUrl = 'https://api-free.deepl.com/v2/translate';
    
    const requestBody = {
      text: [testText],
      target_lang: targetLang,
      source_lang: sourceLang
    };
    
    console.log('📡 DeepL API test isteği gönderiliyor...', { url: deeplUrl, body: requestBody });
    
    const response = await fetch(deeplUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 DeepL API yanıt durumu:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepL API hatası:', errorText);
      return res.status(500).json({ 
        error: 'DeepL API test başarısız', 
        details: `${response.status}: ${errorText}`,
        apiKey: DEEPL_API_KEY ? 'Mevcut' : 'Eksik'
      });
    }
    
    const data = await response.json();
    console.log('✅ DeepL API test başarılı:', data);
    
    res.json({ 
      success: true,
      message: 'DeepL API test başarılı!',
      testInput: testText,
      testOutput: data.translations[0]?.text,
      detectedLanguage: data.translations[0]?.detected_source_language,
      fullResponse: data
    });
    
  } catch (error) {
    console.error('❌ DeepL API test hatası:', error);
    res.status(500).json({ 
      error: 'DeepL API test başarısız', 
      details: error.message 
    });
  }
};

// DeepL API ile çeviri
const translateWithDeepL = async (req, res) => {
  try {
    const { texts, sourceLang, targetLang } = req.body;
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'Çevrilecek metinler gerekli (array formatında)' });
    }
    
    if (!targetLang) {
      return res.status(400).json({ error: 'Hedef dil gerekli' });
    }
    
    // DeepL API key - environment variable'dan al
    const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
    
    if (!DEEPL_API_KEY) {
      return res.status(500).json({ error: 'DeepL API key yapılandırılmamış' });
    }
    
    console.log('🌍 DeepL çeviri başlatılıyor:', { 
      sourceLang, 
      targetLang, 
      textCount: texts.length,
      apiKeyExists: !!DEEPL_API_KEY,
      apiKeyLength: DEEPL_API_KEY ? DEEPL_API_KEY.length : 0
    });
    
    // DeepL API dil kodlarını eşle
    const deeplLangMap = {
      'tr': 'TR',
      'en': 'EN',
      'de': 'DE',
      'fr': 'FR',
      'es': 'ES',
      'it': 'IT',
      'ru': 'RU',
      'ar': 'AR',
      'ja': 'JA',
      'ko': 'KO',
      'pt': 'PT'
    };
    
    const sourceLanguage = sourceLang ? deeplLangMap[sourceLang] : null;
    const targetLanguage = deeplLangMap[targetLang];
    
    if (!targetLanguage) {
      return res.status(400).json({ error: `Desteklenmeyen hedef dil: ${targetLang}` });
    }
    
    // DeepL API'ye istek gönder
    const deeplUrl = 'https://api-free.deepl.com/v2/translate';
    
    const requestBody = {
      text: texts.filter(text => text && text.trim() !== ''), // Boş metinleri filtrele
      target_lang: targetLanguage,
      ...(sourceLanguage && { source_lang: sourceLanguage })
    };
    
    console.log('📡 DeepL API isteği:', { 
      url: deeplUrl, 
      body: requestBody,
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY ? '***' + DEEPL_API_KEY.slice(-4) : 'MISSING'}`,
        'Content-Type': 'application/json'
      }
    });
    
    const response = await fetch(deeplUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepL API hatası:', response.status, errorText);
      return res.status(500).json({ 
        error: 'DeepL çeviri başarısız', 
        details: `${response.status}: ${errorText}` 
      });
    }
    
    const data = await response.json();
    console.log('✅ DeepL yanıtı:', data);
    
    // DeepL yanıtını uygun formata dönüştür
    const translations = data.translations.map(translation => ({
      translatedText: translation.text,
      detectedSourceLanguage: translation.detected_source_language
    }));
    
    console.log('🚀 Response gönderiliyor:', { 
      success: true,
      translations,
      sourceLang: sourceLanguage,
      targetLang: targetLanguage
    });
    
    res.json({ 
      success: true,
      translations,
      sourceLang: sourceLanguage,
      targetLang: targetLanguage
    });
    
  } catch (error) {
    console.error('❌ DeepL çeviri hatası:', error);
    res.status(500).json({ 
      error: 'Çeviri işlemi başarısız', 
      details: error.message 
    });
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
  translateTextTest,
  translateWithDeepL,
  testDeepLAPI
};
