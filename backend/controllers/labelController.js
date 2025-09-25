const { Label, Products, ProductLabel } = require('../models');

// Tüm etiketleri getir
exports.getAllLabels = async (req, res) => {
  try {
    console.log('🔄 Tüm etiketler getiriliyor...');
    
    const labels = await Label.findAll({
      where: {
        business_id: req.user.business_id
      },
      order: [['name', 'ASC']]
    });
    
    console.log(`✅ ${labels.length} etiket getirildi`);
    res.json(labels);
  } catch (error) {
    console.error('❌ Etiket getirme hatası:', error);
    res.status(500).json({ error: 'Etiketler getirilemedi' });
  }
};

// Yeni etiket oluştur
exports.createLabel = async (req, res) => {
  try {
    console.log('🔄 Yeni etiket oluşturuluyor...');
    const { name, description, color, is_active } = req.body;
    
    // Aynı isimde etiket var mı kontrol et
    const existingLabel = await Label.findOne({
      where: { 
        name: name.trim(),
        business_id: req.user.business_id
      }
    });
    
    if (existingLabel) {
      return res.status(400).json({ error: 'Bu isimde bir etiket zaten mevcut' });
    }
    
    const label = await Label.create({
      name: name.trim(),
      description: description?.trim(),
      color: color || '#007bff',
      is_active: is_active !== undefined ? is_active : true,
      business_id: req.user.business_id
    });
    
    console.log('✅ Etiket başarıyla oluşturuldu:', label.name);
    res.status(201).json(label);
  } catch (error) {
    console.error('❌ Etiket oluşturma hatası:', error);
    res.status(500).json({ error: 'Etiket oluşturulamadı' });
  }
};

// Etiket güncelle
exports.updateLabel = async (req, res) => {
  try {
    console.log('🔄 Etiket güncelleniyor...');
    const { id } = req.params;
    const { name, description, color, is_active } = req.body;
    
    const label = await Label.findOne({
      where: {
        label_id: id,
        business_id: req.user.business_id
      }
    });
    if (!label) {
      return res.status(404).json({ error: 'Etiket bulunamadı' });
    }
    
    // Aynı isimde başka etiket var mı kontrol et (kendisi hariç)
    if (name && name.trim() !== label.name) {
      const existingLabel = await Label.findOne({
        where: { 
          name: name.trim(),
          label_id: { [require('sequelize').Op.ne]: id },
          business_id: req.user.business_id
        }
      });
      
      if (existingLabel) {
        return res.status(400).json({ error: 'Bu isimde bir etiket zaten mevcut' });
      }
    }
    
    await label.update({
      name: name?.trim() || label.name,
      description: description?.trim() || label.description,
      color: color || label.color,
      is_active: is_active !== undefined ? is_active : label.is_active
    });
    
    console.log('✅ Etiket başarıyla güncellendi:', label.name);
    res.json(label);
  } catch (error) {
    console.error('❌ Etiket güncelleme hatası:', error);
    res.status(500).json({ error: 'Etiket güncellenemedi' });
  }
};

// Etiket sil
exports.deleteLabel = async (req, res) => {
  try {
    console.log('🔄 Etiket siliniyor...');
    const { id } = req.params;
    
    const label = await Label.findOne({
      where: {
        label_id: id,
        business_id: req.user.business_id
      }
    });
    if (!label) {
      return res.status(404).json({ error: 'Etiket bulunamadı' });
    }
    
    // Etiketin kullanıldığı ürün sayısını kontrol et
    const productCount = await ProductLabel.count({
      where: { label_id: id }
    });
    
    if (productCount > 0) {
      // Soft delete - etiket aktif değil olarak işaretle
      await label.update({ is_active: false });
      console.log('✅ Etiket pasif hale getirildi (soft delete):', label.name);
      res.json({ message: 'Etiket pasif hale getirildi', soft_delete: true });
    } else {
      // Hard delete - etiket tamamen sil
      await label.destroy();
      console.log('✅ Etiket tamamen silindi:', label.name);
      res.json({ message: 'Etiket silindi', soft_delete: false });
    }
  } catch (error) {
    console.error('❌ Etiket silme hatası:', error);
    res.status(500).json({ error: 'Etiket silinemedi' });
  }
};

// Belirli bir ürünün etiketlerini getir
exports.getProductLabels = async (req, res) => {
  try {
    console.log('🔄 Ürün etiketleri getiriliyor...');
    const { productId } = req.params;
    
    const product = await Products.findByPk(productId, {
      include: [{
        model: Label,
        as: 'labels',
        where: { is_active: true },
        required: false
      }]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    console.log(`✅ Ürün etiketleri getirildi: ${product.labels.length} etiket`);
    res.json(product.labels);
  } catch (error) {
    console.error('❌ Ürün etiketleri getirme hatası:', error);
    res.status(500).json({ error: 'Ürün etiketleri getirilemedi' });
  }
};

// Bir etiketi kullanan ürünleri getir
exports.getLabelProducts = async (req, res) => {
  try {
    console.log('🔄 Etiket ürünleri getiriliyor...');
    const { id } = req.params;
    
    const label = await Label.findByPk(id, {
      include: [{
        model: Products,
        as: 'products',
        include: [{
          model: require('./Category'),
          as: 'category'
        }]
      }]
    });
    
    if (!label) {
      return res.status(404).json({ error: 'Etiket bulunamadı' });
    }
    
    console.log(`✅ Etiket ürünleri getirildi: ${label.products.length} ürün`);
    res.json(label.products);
  } catch (error) {
    console.error('❌ Etiket ürünleri getirme hatası:', error);
    res.status(500).json({ error: 'Etiket ürünleri getirilemedi' });
  }
};
