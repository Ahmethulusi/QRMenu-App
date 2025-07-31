
// routes/branches.js (veya uygun controller içinde)
const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const BranchProduct = require('../models/BranchProduct');
const Product = require('../models/Products');
const Business = require('../models/Business');
const Sequelize = require('../db');


exports.getProductsByBranchId = async (req, res) => {
  const { branchId } = req.params;

  try {
    // BranchProduct modelinden doğrudan sorgulama yaparak istediğimiz ilişkilendirmeyi yapalım.
    // Bu, Branch.findByPk üzerinden gitmekten daha doğrudan olabilir
    // ve daha okunaklı bir sonuç objesi verir.
    const branchProducts = await BranchProduct.findAll({
      where: { branch_id: branchId },
      include: [
        {
          model: Product, // İlişkili Product modelini dahil et
          attributes: ['product_name'], // Sadece product_name'i çekmek için attributes belirtildi
        },
      ],
      // BranchProduct'tan hangi sütunları çekmek istediğinizi burada belirtebilirsiniz.
      // Zaten branch_id ve product_id PK olduğu için otomatik gelir.
      attributes: ['branch_id', 'product_id', 'price', 'stock'],
    });

    // Gelen veriyi istediğiniz formata dönüştürme
    const formattedProducts = branchProducts.map(bp => ({
      branch_id: bp.branch_id,
      product_id: bp.product_id,
      product_name: bp.Product ? bp.Product.product_name : null, // Product ilişkisi null olabilir ihtimaline karşı kontrol
      price: bp.price,
      stock: bp.stock,
    }));

    return res.json(formattedProducts);
  } catch (err) {
    console.error("Şubeye bağlı ürünleri getirme hatası:", err);
    res.status(500).json({ message: 'Sunucu hatası: Şubeye bağlı ürünler getirilemedi.' });
  }
};

// controllers/businessController.js

exports.getBusinessDetailsWithProducts = async (req, res) => {
  const { businessId } = req.params;

  try {
    const business = await Business.findByPk(businessId, {
      include: [
        {
          model: Branch,
          include: [
            {
              model: BranchProduct,
              include: [
                {
                  model: Product,
                  attributes: ['product_id', 'product_name', 'description', 'price'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!business) {
      return res.status(404).json({ message: 'İşletme bulunamadı' });
    }

    return res.json(business);
  } catch (error) {
    console.error('HATA:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
};


exports.getAllBranchesByBusinessId = async (req, res) => {
    try {
      const { businessId } = req.params;
      console.log('📦 Gelen parametre:', req.params);

      if (!businessId) {
        return res.status(400).json({ error: 'business_id parametresi gerekli' });
      }
  
      const branches = await Branch.findAll({
        where: { business_id: businessId },
        order: [['id', 'ASC']],
      });

      console.log(branches);
      res.json(branches);
    } catch (err) {
      console.error('Şubeler alınamadı:', err);
      res.status(500).json({ error: 'Şubeler alınamadı' });
    }
  };
  

  // POST /branches
exports.createBranch = async (req, res) => {
  try {
    const { name, adress, businessId} = req.body;

    const newBranch = await Branch.create({
      name,
      adress,
      business_id:businessId
    });

    res.status(201).json(newBranch);
  } catch (error) {
    console.error('Şube oluşturulamadı:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// PUT /branches/:id
exports.updateBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { name, adress } = req.body;

    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({ error: 'Şube bulunamadı' });
    }

    branch.name = name;
    branch.adress = adress;
    await branch.save();

    res.status(200).json(branch);
  } catch (error) {
    console.error('Şube güncellenemedi:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// DELETE /branches/:id
exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Branch.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Şube bulunamadı' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Şube silinemedi:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// GET /branch/:id
exports.getBranchById = async (req, res) => {
  try {
    const { branchId } = req.params;

    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({ error: 'Şube bulunamadı' });
    }

    res.status(200).json(branch);
  } catch (error) {
    console.error('Şube alınamadı:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Yeni fonksiyon: Bir şubeye bağlı ürünleri getirme
// exports.getBranchProductsByBranchId = async (req, res) => {
//   try {
//     const { branchId } = req.params;

//     if (!branchId) {
//       return res.status(400).json({ error: "Şube ID'si eksik." });
//     }

//     // BranchProduct tablosundan ilgili şubeye ait kayıtları ve Product bilgilerini çekme
//     const branchProducts = await BranchProduct.findAll({
//       where: { branch_id: branchId },
//       include: [
//         {
//           model: Product, // İlişkili Product modelini dahil et
//           attributes: ['id', 'product_name', 'description', 'price', 'image_url'], // Product'tan istediğiniz alanlar
//         },
//       ],
//     });

//     if (!branchProducts || branchProducts.length === 0) {
//       return res.status(404).json({ message: 'Bu şubeye ait ürün bulunamadı.' });
//     }

//     return res.status(200).json(branchProducts);
//   } catch (error) {
//     console.error('Şubeye bağlı ürünleri getirme hatası:', error);
//     return res.status(500).json({ error: 'Sunucu hatası: Şubeye bağlı ürünler getirilemedi.' });
//   }
// };


exports.createBranchProduct = async (req, res) => {
  const { branch_id, product_id, price, stock } = req.body;

  try {
    // Zorunlu alan kontrolü
    if (!branch_id || !product_id || price === undefined || stock === undefined) {
      return res.status(400).json({ error: "branch_id, product_id, price ve stock alanları zorunludur." });
    }

    // Şube ve ürünün gerçekten var olup olmadığını kontrol et
    const branchExists = await Branch.findByPk(branch_id);
    const productExists = await Product.findByPk(product_id);

    if (!branchExists) {
      return res.status(404).json({ error: `Belirtilen şube (ID: ${branch_id}) bulunamadı.` });
    }
    if (!productExists) {
      return res.status(404).json({ error: `Belirtilen ürün (ID: ${product_id}) bulunamadı.` });
    }

    // Aynı şube ve ürün kombinasyonunun zaten olup olmadığını kontrol et
    const existingBranchProduct = await BranchProduct.findOne({
      where: {
        branch_id: branch_id,
        product_id: product_id,
      },
    });

    if (existingBranchProduct) {
      // Eğer mevcutsa, güncelleyebilir veya hata dönebilirsiniz.
      // Bu örnekte, var olan bir kaydı güncellemek yerine, hata döndürüyoruz.
      // İsterseniz burada 'existingBranchProduct.update({ price, stock })' yapabilirsiniz.
      return res.status(409).json({ error: 'Bu ürün zaten bu şubeye eklenmiş. Mevcut ürünü güncelleyin.' });
    }

    // Yeni BranchProduct kaydını oluştur
    const newBranchProduct = await BranchProduct.create({
      branch_id,
      product_id,
      price,
      stock,
    });

    return res.status(201).json(newBranchProduct);
  } catch (error) {
    console.error('Şubeye ürün ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası: Ürün şubeye eklenirken bir hata oluştu.' });
  }
};


exports.AddProductToBranch= async (req, res) => {
  const transaction = await Sequelize.transaction();
  try {
    const { branch_id, product_ids } = req.body;

    if (!branch_id || !product_ids || !Array.isArray(product_ids)) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Geçersiz istek. branch_id ve product_ids (array) gereklidir.' 
      });
    }

    const results = [];
    const errors = [];

    for (const product_id of product_ids) {
      try {
        // Ürünün business'a ait olduğunu kontrol et
        const product = await Product.findOne({
          where: { product_id: product_id },
          transaction
        });

        if (!product) {
          errors.push({ product_id, error: 'Ürün bulunamadı' });
          continue;
        }

        // BranchProduct oluştur
        const record = await BranchProduct.create({
          branch_id,
          product_id,
          price: 0, // Varsayılan değer
          stock: 0  // Varsayılan değer
        }, { transaction });

        results.push(record);
      } catch (error) {
        errors.push({ product_id, error: error.message });
      }
    }

    if (errors.length > 0 && results.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Hiçbir ürün eklenemedi',
        details: errors 
      });
    }

    await transaction.commit();
    
    res.status(201).json({
      message: `${results.length} ürün başarıyla eklendi`,
      added: results.length,
      failed: errors.length,
      successes: results.map(r => r.product_id),
      errors
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Ürün ekleme hatası:', error);
    res.status(500).json({ error: 'Ürün eklenirken bir hata oluştu' });
  }
};

// Şube ürününde fiyat ve stok güncelleme
exports.updateBranchProduct = async (req, res) => {
  try {
    const { branch_id, product_id, price, stock } = req.body;

    if (!branch_id || !product_id) {
      return res.status(400).json({ error: 'branch_id ve product_id zorunludur.' });
    }

    // Model adını ezmeden doğru kullan
    const branchProduct = await BranchProduct.findOne({
      where: { branch_id, product_id }
    });

    if (!branchProduct) {
      return res.status(404).json({ error: 'Şubeye ait ürün bulunamadı.' });
    }

    // Fiyat ve stok güncelle
    if (price !== undefined) branchProduct.price = price;
    if (stock !== undefined) branchProduct.stock = stock;

    await branchProduct.save();

    return res.status(200).json({ success: true, branchProduct });
  } catch (error) {
    console.error('Şube ürün güncelleme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası: Şube ürün güncellenemedi.' });
  }
};

// Şubeye eklenebilecek ürünleri getir (henüz eklenmemiş olanlar)
exports.getAvailableProductsForBranch = async (req, res) => {
  try {
    const { branchId, businessId } = req.params;

    if (!branchId || !businessId) {
      return res.status(400).json({ error: 'branchId ve businessId parametreleri zorunludur.' });
    }

    // Önce şubeye ait ürünlerin ID'lerini al
    const branchProducts = await BranchProduct.findAll({
      where: { branch_id: branchId },
      attributes: ['product_id']
    });

    const existingProductIds = branchProducts.map(bp => bp.product_id);

    // İşletmeye ait tüm ürünleri al, ancak şubede olmayanları filtrele
    const allProducts = await Product.findAll({
      where: { business_id: businessId },
      attributes: ['product_id', 'product_name', 'description', 'price', 'image_url']
    });

    // Şubede olmayan ürünleri filtrele
    const availableProducts = allProducts.filter(product => 
      !existingProductIds.includes(product.product_id)
    );

    return res.status(200).json(availableProducts);
  } catch (error) {
    console.error('Şubeye eklenebilecek ürünleri getirme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası: Ürünler getirilemedi.' });
  }
};


exports.deleteBranchProduct = async (req, res) => {
  try {
    const { branch_id, product_id } = req.body;
    const deleted = await BranchProduct.destroy({
      where: { branch_id, product_id }
    });
    if (deleted) {
      return res.status(200).json({ success: true });
    }
    return res.status(404).json({ error: 'Kayıt bulunamadı' });
  } catch (error) {
    console.error('Silme hatası:', error);
    return res.status(500).json({ error: 'Silme işlemi sırasında hata oluştu' });
  }
};








