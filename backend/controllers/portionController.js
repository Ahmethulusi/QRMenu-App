const { Portion, Products } = require('../models');

// Belirli bir ürün için tüm porsiyonları getir
exports.getProductPortions = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Products.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    const portions = await Portion.findAll({
      where: { product_id: productId },
      order: [['portion_id', 'ASC']]
    });

    // Porsiyon bilgilerini ana ürün fiyatıyla birlikte gönder
    const result = {
      base_price: product.price,
      currency_code: product.currency_code,
      portions: portions
    };

    res.json(result);
  } catch (error) {
    console.error('❌ Porsiyonları getirme hatası:', error);
    res.status(500).json({ error: 'Porsiyonlar getirilemedi' });
  }
};

// Yeni porsiyon oluştur
exports.createPortion = async (req, res) => {
  try {
    const { product_id, name, quantity, price } = req.body;

    if (!product_id || !name) {
      return res.status(400).json({ error: 'product_id ve name zorunludur' });
    }

    const product = await Products.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    const portion = await Portion.create({
      product_id,
      name: name.trim(),
      quantity: quantity?.trim() || null,
      price: price !== undefined ? price : null
    });

    res.status(201).json(portion);
  } catch (error) {
    console.error('❌ Porsiyon oluşturma hatası:', error);
    res.status(500).json({ error: 'Porsiyon oluşturulamadı' });
  }
};

// Porsiyon güncelle
exports.updatePortion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, price } = req.body;

    const portion = await Portion.findByPk(id);
    if (!portion) {
      return res.status(404).json({ error: 'Porsiyon bulunamadı' });
    }

    await portion.update({
      name: name?.trim() || portion.name,
      quantity: quantity?.trim() || portion.quantity,
      price: price !== undefined ? price : portion.price
    });

    res.json(portion);
  } catch (error) {
    console.error('❌ Porsiyon güncelleme hatası:', error);
    res.status(500).json({ error: 'Porsiyon güncellenemedi' });
  }
};

// Porsiyon sil
exports.deletePortion = async (req, res) => {
  try {
    const { id } = req.params;

    const portion = await Portion.findByPk(id);
    if (!portion) {
      return res.status(404).json({ error: 'Porsiyon bulunamadı' });
    }

    await portion.destroy();
    res.json({ message: 'Porsiyon silindi' });
  } catch (error) {
    console.error('❌ Porsiyon silme hatası:', error);
    res.status(500).json({ error: 'Porsiyon silinemedi' });
  }
};


