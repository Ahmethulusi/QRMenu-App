const { Ingredient, Products } = require('../models');

// Belirli bir ürün için tüm malzemeleri getir
exports.getProductIngredients = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Products.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    const ingredients = await Ingredient.findAll({
      where: { product_id: productId },
      order: [['ingredient_id', 'ASC']]
    });

    res.json(ingredients);
  } catch (error) {
    console.error('❌ Malzemeleri getirme hatası:', error);
    res.status(500).json({ 
      error: 'Malzemeler getirilemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Yeni malzeme oluştur
exports.createIngredient = async (req, res) => {
  try {
    const { product_id, name, type } = req.body;

    if (!product_id || !name || !type) {
      return res.status(400).json({ error: 'product_id, name ve type zorunludur' });
    }

    // Malzeme tipi kontrolü
    if (type !== 'ekstra' && type !== 'çıkarılacak') {
      return res.status(400).json({ error: 'type değeri "ekstra" veya "çıkarılacak" olmalıdır' });
    }

    const product = await Products.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    const ingredient = await Ingredient.create({
      product_id,
      name: name.trim(),
      type
    });

    res.status(201).json(ingredient);
  } catch (error) {
    console.error('❌ Malzeme oluşturma hatası:', error);
    res.status(500).json({ 
      error: 'Malzeme oluşturulamadı',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Malzeme güncelle
exports.updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Malzeme bulunamadı' });
    }

    // Malzeme tipi kontrolü (eğer güncellendiyse)
    if (type && type !== 'ekstra' && type !== 'çıkarılacak') {
      return res.status(400).json({ error: 'type değeri "ekstra" veya "çıkarılacak" olmalıdır' });
    }

    await ingredient.update({
      name: name?.trim() || ingredient.name,
      type: type || ingredient.type
    });

    res.json(ingredient);
  } catch (error) {
    console.error('❌ Malzeme güncelleme hatası:', error);
    res.status(500).json({ 
      error: 'Malzeme güncellenemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Malzeme sil
exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Malzeme bulunamadı' });
    }

    await ingredient.destroy();
    res.json({ message: 'Malzeme silindi' });
  } catch (error) {
    console.error('❌ Malzeme silme hatası:', error);
    res.status(500).json({ 
      error: 'Malzeme silinemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Belirli bir malzemeyi getir
exports.getIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Malzeme bulunamadı' });
    }

    res.json(ingredient);
  } catch (error) {
    console.error('❌ Malzeme getirme hatası:', error);
    res.status(500).json({ 
      error: 'Malzeme getirilemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Tüm malzemeleri getir (admin için)
exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({
      include: [{
        model: Products,
        as: 'product',
        attributes: ['product_id', 'product_name']
      }],
      order: [['ingredient_id', 'ASC']]
    });

    res.json(ingredients);
  } catch (error) {
    console.error('❌ Tüm malzemeleri getirme hatası:', error);
    res.status(500).json({ 
      error: 'Malzemeler getirilemedi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
