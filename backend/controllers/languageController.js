const { Language, ProductTranslation, CategoryTranslation, BusinessTranslation, Currency } = require('../models');

// Tüm aktif dilleri getir
const getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.findAll({
      where: { is_active: true },
      include: [{
        model: Currency,
        as: 'defaultCurrency',
        attributes: ['code', 'name', 'symbol']
      }],
      order: [['is_default', 'DESC'], ['name', 'ASC']]
    });
    
    res.json(languages);
  } catch (error) {
    console.error('Diller getirilirken hata:', error);
    res.status(500).json({ error: 'Diller getirilemedi' });
  }
};

// Varsayılan dili getir
const getDefaultLanguage = async (req, res) => {
  try {
    const defaultLang = await Language.findOne({
      where: { is_default: true, is_active: true }
    });
    
    if (!defaultLang) {
      return res.status(404).json({ error: 'Varsayılan dil bulunamadı' });
    }
    
    res.json(defaultLang);
  } catch (error) {
    console.error('Varsayılan dil getirilirken hata:', error);
    res.status(500).json({ error: 'Varsayılan dil getirilemedi' });
  }
};

// Yeni dil ekle (Admin only)
const addLanguage = async (req, res) => {
  try {
    const { code, name, native_name, direction = 'ltr' } = req.body;
    
    if (!code || !name || !native_name) {
      return res.status(400).json({ error: 'Gerekli alanlar eksik' });
    }
    
    // Dil kodu benzersiz mi kontrol et
    const existingLang = await Language.findOne({ where: { code } });
    if (existingLang) {
      return res.status(400).json({ error: 'Bu dil kodu zaten mevcut' });
    }
    
    const newLanguage = await Language.create({
      code,
      name,
      native_name,
      direction,
      is_default: false,
      is_active: true
    });
    
    res.status(201).json(newLanguage);
  } catch (error) {
    console.error('Dil eklenirken hata:', error);
    res.status(500).json({ error: 'Dil eklenemedi' });
  }
};

// Dil güncelle (Admin only)
const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, native_name, direction, is_active, default_currency_code } = req.body;
    
    const language = await Language.findByPk(id);
    if (!language) {
      return res.status(404).json({ error: 'Dil bulunamadı' });
    }
    
    // Varsayılan dil pasif yapılamaz
    if (language.is_default && is_active === false) {
      return res.status(400).json({ error: 'Varsayılan dil pasif yapılamaz' });
    }
    
    // Para birimi kodu geçerli mi kontrol et
    if (default_currency_code) {
      const currency = await Currency.findOne({ where: { code: default_currency_code } });
      if (!currency) {
        return res.status(400).json({ error: 'Geçersiz para birimi kodu' });
      }
    }
    
    await language.update({
      name: name || language.name,
      native_name: native_name || language.native_name,
      direction: direction || language.direction,
      is_active: is_active !== undefined ? is_active : language.is_active,
      default_currency_code: default_currency_code !== undefined ? default_currency_code : language.default_currency_code
    });
    
    // Güncellenmiş dili para birimi bilgisiyle birlikte döndür
    const updatedLanguage = await Language.findByPk(id, {
      include: [{
        model: Currency,
        as: 'defaultCurrency',
        attributes: ['code', 'name', 'symbol']
      }]
    });
    
    res.json(updatedLanguage);
  } catch (error) {
    console.error('Dil güncellenirken hata:', error);
    res.status(500).json({ error: 'Dil güncellenemedi' });
  }
};

// Varsayılan dili değiştir (Admin only)
const setDefaultLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const newDefault = await Language.findByPk(id);
    if (!newDefault) {
      return res.status(404).json({ error: 'Dil bulunamadı' });
    }
    
    if (!newDefault.is_active) {
      return res.status(400).json({ error: 'Pasif dil varsayılan yapılamaz' });
    }
    
    // Önceki varsayılan dili kaldır
    await Language.update(
      { is_default: false },
      { where: { is_default: true } }
    );
    
    // Yeni varsayılan dili ayarla
    await newDefault.update({ is_default: true });
    
    res.json(newDefault);
  } catch (error) {
    console.error('Varsayılan dil değiştirilirken hata:', error);
    res.status(500).json({ error: 'Varsayılan dil değiştirilemedi' });
  }
};

// Dil sil (Admin only) - Sadece hiç kullanılmayan diller silinebilir
const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const language = await Language.findByPk(id);
    if (!language) {
      return res.status(404).json({ error: 'Dil bulunamadı' });
    }
    
    if (language.is_default) {
      return res.status(400).json({ error: 'Varsayılan dil silinemez' });
    }
    
    // Dil kullanımda mı kontrol et
    const productCount = await ProductTranslation.count({ where: { language_code: language.code } });
    const categoryCount = await CategoryTranslation.count({ where: { language_code: language.code } });
    const businessCount = await BusinessTranslation.count({ where: { language_code: language.code } });
    
    if (productCount > 0 || categoryCount > 0 || businessCount > 0) {
      return res.status(400).json({ 
        error: 'Bu dil kullanımda olduğu için silinemez',
        usage: { products: productCount, categories: categoryCount, businesses: businessCount }
      });
    }
    
    await language.destroy();
    res.json({ message: 'Dil başarıyla silindi' });
  } catch (error) {
    console.error('Dil silinirken hata:', error);
    res.status(500).json({ error: 'Dil silinemedi' });
  }
};

module.exports = {
  getAllLanguages,
  getDefaultLanguage,
  addLanguage,
  updateLanguage,
  setDefaultLanguage,
  deleteLanguage
};
