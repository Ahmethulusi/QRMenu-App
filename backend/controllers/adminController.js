const Products = require('../models/Products');
const Category = require('../models/Category');
const Business = require('../models/Business');
const { Label, ProductLabel } = require('../models');
const xlsx = require('xlsx');
const { Op } = require("sequelize");
const sequelize = require('../db');
const { hasPermission } = require('../utils/permissionUtils');
const { deleteImage, getImageUrl } = require('../middleware/uploadMiddleware');


exports.updateImageUrl = async (req, res) => {
    const {productId } = req.body;
    const imageUrl = req.file.filename;

    try {
        const result = await Products.update({ image_url: imageUrl }, { where: { product_id: productId } });
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json("Internal Server Error");
    }
}


// Tüm ürünleri getir
exports.getAllProuducts = async (req, res) => {
  try {
    console.log('🔄 Tüm ürünler getiriliyor...');
    console.log('👤 Kullanıcı:', req.user);
    
    const products = await Products.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'category_name']
        },
        {
          model: Label,
          as: 'labels',
          attributes: ['label_id', 'name', 'color'],
          through: { attributes: [] }, // ProductLabel junction tablosundan hiçbir alan almayız
          required: false
        }
      ]
    });
    
    console.log(`✅ ${products.length} ürün bulundu`);
    if (products.length > 0) {
      console.log('📦 İlk ürün örneği:', {
        product_id: products[0].product_id,
        product_name: products[0].product_name,
        category: products[0].category ? products[0].category.category_name : 'Yok',
        labels: products[0].labels ? products[0].labels.length : 0
      });
    }
    
    res.json(products);
  } catch (error) {
    console.error('❌ Ürün getirme hatası:', error);
    res.status(500).json({ error: 'Ürünler alınamadı' });
  }
};
exports.getAllProductsOrderBySiraId = async (req,res) => {
    try {
        const products = await Products.findAll({
            order:[['sira_id','ASC']]
        })
        res.json(products);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'An error occurred while fetching products.'});
    }
}

exports.updateProductsBySiraId = async (req, res) => {
    const { products } = req.body;

    try {
        // Her ürün için geçici bir sira_id değeri kullanarak güncelleyin
        const count = await Products.count();
        for (let i = 0; i < count; i++) {
            const product = products[i];
            await Products.update(
                { sira_id: i + 1 },
                { where: { product_id: product.product_id } }
            );
        }

        res.status(200).json({ message: 'Products updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
};

exports.getProductsByBusiness = async (req, res) => {
    const { business_id } = req.params; 
    try {
      if (!business_id) {
        return res.status(400).json({ message: 'Kategori ID gerekli' });
      }
  
      const products = await Products.findAll({ where: { business_id } });
  
      res.status(200).json(products);
    } catch (error) {
      console.error('Ürünler alınırken hata oluştu:', error);
      res.status(500).json({ message: 'Ürünler alınamadı' });
    }
  };

exports.getProductById = async (req, res) => {
    try {
        const db = require('../models');
        const product = await Products.findOne({
            where: { product_id: req.params.id },
            include: [
                { 
                    model: Category,
                    as: 'category',
                    attributes: ['category_id', 'category_name']
                },
                { 
                    model: db.Business 
                },
                { 
                    model: db.Branch, 
                    through: { attributes: ['price', 'stock'] } 
                }
            ]
        });
        res.json(product);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while fetching the product.' });
    }
}
// 1. Update createProduct to require business_id and optionally assign to branches
exports.createProduct = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: "Request body is empty" });
    }
    
    const transaction = await sequelize.transaction();
    
    try {
        const { name, price, description, category_id, status, showcase, labels } = req.body;
        const imageUrl = req.file ? req.file.filename : null;

        console.log('🔍 Request body:', req.body);
        console.log('🏷️ Labels raw:', labels);
        console.log('🏷️ Labels type:', typeof labels);

        if (!name || !price || !category_id) {
            return res.status(400).json({ error: "Zorunlu alanlar eksik" });
        }

        const existingProduct = await Products.findOne({ 
            where: { product_name: name, business_id: 8 } 
        });
        if (existingProduct) {
            return res.status(400).json({ error: "Bu ürün zaten mevcut" }); 
        }

        const count = await Products.count();
        
        const { stock, calorie_count, cooking_time, carbs, protein, fat, allergens, recommended_with } = req.body;
        
        // Ürünü oluştur
        const product = await Products.create({
            product_name: name,
            price: parseFloat(price),
            description,
            category_id: parseInt(category_id),
            is_available: status === 'true' || status === true,
            is_selected: showcase === 'true' || showcase === true,
            sira_id: count + 1,
            image_url: imageUrl,
            business_id: 1,
            stock: stock ? parseInt(stock) : null,
            calorie_count: calorie_count ? parseInt(calorie_count) : null,
            cooking_time: cooking_time ? parseInt(cooking_time) : null,
            carbs: carbs ? parseFloat(carbs) : null,
            protein: protein ? parseFloat(protein) : null,
            fat: fat ? parseFloat(fat) : null,
            allergens: allergens || null,
            recommended_with: recommended_with || null
        }, { transaction });

        // Etiketleri ekle (eğer varsa)
        let labelArray = labels;
        if (typeof labels === 'string') {
            try {
                labelArray = JSON.parse(labels);
            } catch (e) {
                console.log('❌ Labels JSON parse hatası:', e);
                labelArray = [];
            }
        }
        
        console.log('🏷️ Label array after parse:', labelArray);
        console.log('🏷️ Is array?', Array.isArray(labelArray));
        
        if (labelArray && Array.isArray(labelArray) && labelArray.length > 0) {
            const labelIds = labelArray.map(labelId => parseInt(labelId)).filter(id => !isNaN(id));
            console.log('🏷️ Label IDs:', labelIds);
            
            if (labelIds.length > 0) {
                // Etiketlerin geçerli olduğunu kontrol et
                const validLabels = await Label.findAll({
                    where: { 
                        label_id: labelIds
                    },
                    transaction
                });
                
                console.log('🏷️ Valid labels found:', validLabels.length);
                console.log('🏷️ Valid labels:', validLabels.map(l => ({ id: l.label_id, name: l.name })));
                
                if (validLabels.length > 0) {
                    await product.setLabels(validLabels, { transaction });
                    console.log(`✅ Ürüne ${validLabels.length} etiket eklendi`);
                } else {
                    console.log('❌ Geçerli etiket bulunamadı');
                }
            } else {
                console.log('❌ Geçerli label ID bulunamadı');
            }
        } else {
            console.log('❌ Label array boş veya geçersiz');
        }

        await transaction.commit();
        
        // Ürünü etiketleriyle birlikte getir
        const productWithLabels = await Products.findByPk(product.product_id, {
            include: [{
                model: Label,
                as: 'labels',
                attributes: ['label_id', 'name', 'color'],
                through: { attributes: [] }
            }]
        });

        console.log('✅ Ürün başarıyla oluşturuldu:', productWithLabels.product_name);
        res.status(201).json(productWithLabels);
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Ürün oluşturma hatası:', error);
        res.status(500).json({ error: "Ürün oluşturulamadı: " + error.message });
    }
};


// Ürün Silme Endpoint'i
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Önce ürünü bul ve resim bilgisini al
    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    // Eğer ürünün resmi varsa, resmi de sil
    if (product.image_url) {
      const imagePath = `public/images/${product.image_url}`;
      deleteImage(imagePath);
    }

    // Önce branch_products tablosundaki kayıtları sil
    const BranchProduct = require('../models/BranchProduct');
    await BranchProduct.destroy({
      where: { product_id: id }
    });

    // Sonra ürünü sil
    const deleted = await Products.destroy({
      where: { product_id: id }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};



// 4. Update updateProduct to allow updating business_id and branch assignments
exports.updateProduct = async (req, res) => {
    const { newName, newPrice, newDescription, newCategory_id, newBusiness_id, id, branch_ids, branch_prices, branch_stocks, status, showcase, labels } = req.body;
    // Yeni alanlar
    const { stock, calorie_count, cooking_time, carbs, protein, fat, allergens, recommended_with } = req.body;
    try {
        console.log('🔄 Ürün güncelleniyor:', { id, labels });
        
        // Güncellenecek alanları hazırla
        const updateData = {
            product_name: newName,
            price: newPrice,
            description: newDescription,
            business_id: newBusiness_id,
            is_available: status,
            is_selected: showcase
        };

        // category_id sadece geçerli bir değer varsa ekle
        if (newCategory_id !== null && newCategory_id !== undefined) {
            updateData.category_id = newCategory_id;
        }

        // Yeni alanları (gönderildiyse) ekle - tip dönüşümleriyle
        if (stock !== undefined) {
            const parsed = parseInt(stock);
            updateData.stock = isNaN(parsed) ? null : parsed;
        }
        if (calorie_count !== undefined) {
            const parsed = parseInt(calorie_count);
            updateData.calorie_count = isNaN(parsed) ? null : parsed;
        }
        if (cooking_time !== undefined) {
            const parsed = parseInt(cooking_time);
            updateData.cooking_time = isNaN(parsed) ? null : parsed;
        }
        if (carbs !== undefined) {
            const parsed = parseFloat(carbs);
            updateData.carbs = isNaN(parsed) ? null : parsed;
        }
        if (protein !== undefined) {
            const parsed = parseFloat(protein);
            updateData.protein = isNaN(parsed) ? null : parsed;
        }
        if (fat !== undefined) {
            const parsed = parseFloat(fat);
            updateData.fat = isNaN(parsed) ? null : parsed;
        }
        if (allergens !== undefined) {
            updateData.allergens = allergens || null;
        }
        if (recommended_with !== undefined) {
            // Frontend genelde JSON.stringify edilmiş array gönderiyor; direkt TEXT olarak saklıyoruz
            updateData.recommended_with = recommended_with || null;
        }

        await Products.update(updateData, {
            where: { product_id: id }
        });

        // Etiketleri güncelle
        if (Array.isArray(labels)) {
            console.log('🔄 Etiketler güncelleniyor:', labels);
            
            // Ürünü bul
            const productInstance = await Products.findByPk(id);
            if (productInstance) {
                // Geçerli etiketleri kontrol et
                const validLabels = await Label.findAll({
                    where: {
                        label_id: labels
                    }
                });
                
                console.log('✅ Geçerli etiketler bulundu:', validLabels.length);
                
                // Etiketleri güncelle
                await productInstance.setLabels(validLabels.map(label => label.label_id));
                console.log('✅ Ürün etiketleri güncellendi');
            }
        }

        // Update branch assignments if provided
        if (Array.isArray(branch_ids)) {
            const BranchProduct = require('../models/BranchProduct');
            // Remove old assignments
            await BranchProduct.destroy({ where: { product_id: id } });
            // Add new assignments
            for (let i = 0; i < branch_ids.length; i++) {
                await BranchProduct.create({
                    branch_id: branch_ids[i],
                    product_id: id,
                    price: branch_prices && branch_prices[i] ? branch_prices[i] : newPrice,
                    stock: branch_stocks && branch_stocks[i] ? branch_stocks[i] : null
                });
            }
        }
        
        // Güncellenmiş ürünü ilişkileriyle birlikte döndür
        const updatedProduct = await Products.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['category_id', 'category_name']
                },
                {
                    model: Label,
                    as: 'labels',
                    attributes: ['label_id', 'name', 'color'],
                    through: { attributes: [] },
                    required: false
                }
            ]
        });

        console.log('✅ Ürün başarıyla güncellendi');
        res.json(updatedProduct);
    } catch (error) {
        console.error('❌ Ürün güncelleme hatası:', error);
        res.status(500).json({ error: 'An error occurred while updating the product.' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        console.log(error);
    }
}

// Sadece kategori listesi için (yetki kontrolü olmadan) - CategorySelector için
exports.getCategoriesList = async (req, res) => {
    try {
        console.log('🔄 Kategori listesi getiriliyor (yetki kontrolü olmadan)');
        const categories = await Category.findAll({
            attributes: ['category_id', 'category_name'],
            order: [['sira_id', 'ASC']]
        });
        console.log(`✅ ${categories.length} kategori bulundu`);
        res.json(categories);
    } catch (error) {
        console.error('❌ Kategori listesi hatası:', error);
        res.status(500).json({ error: "Kategoriler alınamadı" });
    }
}

// Kategori silme endpointi
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const productCount = await Products.count({ where: { category_id: id } });
    if (productCount > 0) {
      return res.status(400).json({ error: 'Bu kategoriye bağlı ürünler var, önce ürünleri silin veya başka kategoriye taşıyın.' });
    }
    const deleted = await Category.destroy({ where: { category_id: id } });
    if (deleted) {
      res.json({ message: 'Kategori silindi' });
    } else {
      res.status(404).json({ error: 'Kategori bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Silme işlemi başarısız' });
  }
};


// Kategori oluştururken parent_id desteği
exports.createCategory = async (req, res) => {
  try {
    const { category_name, parent_id } = req.body;
    const image_url = req.file ? req.file.filename : null;
    if (!category_name) {
      return res.status(400).json({ error: "Kategori adı boş olamaz!" });
    }
    const category = await Category.create({
      category_name: category_name,
      sira_id: 0,
      parent_id: parent_id ? parseInt(parent_id) : null,
      image_url: image_url
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Bir hata oluştu!" });
  }
};
  

// ✅ 1. backend/controller/adminController.js içine alt kategori oluşturmayı doğru şekilde sağlayan endpoint
exports.createSubCategory = async (req, res) => {
  const { name, parentId } = req.body;
  try {
    const category = await Category.create({
      category_name: name,
      sira_id: 0,
      parent_id: parentId || null
    });
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Alt kategori oluşturulamadı' });
  }
};

exports.getSubCategoriesByParentId = async (req,res) => {
    const id = req.params.id;
    try {
        const otherSubCategories = await Category.findAll({
            where: {
                parent_id: id
            }
        });
        res.json(otherSubCategories);
    } catch (error) {
        console.log(error);
    }
};




exports.getCategoryById = async (req, res) => {
    const id = req.params.id;
    try {
        const category = await Category.findOne({
            where: {
                category_id: id
            }
        });
        res.json(category);
    } catch (error) {
        console.log(error);
    }
}


exports.getLastCategory = async (req, res) => {
    try {
      const lastCategory = await Category.findOne({
        order: [['category_id', 'DESC']],
        limit: 1
      });
      res.json(lastCategory);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching the last category.' });
    }
  };

// Kategori güncelleme endpoint'i
exports.updateCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const { category_name, removeImage } = req.body;
    const imageFile = req.file;

    let imageUrl = null;

    // Eğer resim kaldırılacaksa
    if (removeImage === 'true') {
      imageUrl = null;
    }
    // Eğer yeni resim yüklenecekse
    else if (imageFile) {
      imageUrl = imageFile.filename;
    }
    // Eğer hiçbir değişiklik yoksa mevcut resmi koru
    else {
      // Mevcut kategoriyi bul ve resmini koru
      const existingCategory = await Category.findByPk(category_id);
      if (existingCategory) {
        imageUrl = existingCategory.image_url;
      }
    }

    // Kategoriyi güncelle
    await Category.update(
      { 
        category_name: category_name,
        image_url: imageUrl 
      },
      { where: { category_id: category_id } }
    );

    res.json({ 
      message: 'Kategori başarıyla güncellendi',
      image_url: imageUrl 
    });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    res.status(500).json({ error: 'Kategori güncellenirken bir hata oluştu' });
  }
};

  







exports.updateProductPrices = async (req,res)=>{
    const {price,product_id} = req.body;
    
    try {
        const product = await Products.update({
            price:price
        },
        {
          where:{
            product_id:product_id
          }
        });
        res.json(product);
    } catch (error) {
        console.log(error);
    }
}

exports.bulkCreatePrices = async (req, res) => {
    const { categoryIds, percentage } = req.body;
  
    try {
      // Veri validasyonu (isteğe bağlı)
      if (!Array.isArray(categoryIds) || !percentage) {
        return res.status(400).json({ error: 'Geçersiz veri' });
      }
  
      const products = await Products.findAll({
        where: {
          category_id: {
            [Op.in]: categoryIds,
          },
        },
      });
  
      const updatedProducts = await Promise.all(
        products.map(async (product) => {
          const newPrice = product.price * (1 + percentage / 100);
          product.price = Math.round(newPrice);
          await product.save();
          return product;
        })
      );
  
      res.json({ message: 'Fiyatlar başarıyla güncellendi', updatedProducts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Bir hata oluştu' });
    }
};

exports.getProductsByCategory = async (req, res) => {
    const { category_id } = req.params; 
    try {
      if (!category_id) {
        return res.status(400).json({ message: 'Kategori ID gerekli' });
      }
  
      const products = await Products.findAll({ where: { category_id } });
  
      res.status(200).json(products);
    } catch (error) {
      console.error('Ürünler alınırken hata oluştu:', error);
      res.status(500).json({ message: 'Ürünler alınamadı' });
    }
  };

exports.updateShowcase = async (req, res) => {
  const { productId } = req.params; // URL'den productId'yi alıyoruz
  const { showcase } = req.body; // Body'den showcase durumunu alıyoruz

  try {
    const product = await Products.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı!' });
    }

    // Ürünün showcase durumunu güncelle
    product.is_selected = showcase;
    console.log(showcase);
    await product.save();

    return res.status(200).json({ message: 'Vitrin durumu başarıyla güncellendi.', product });
    }catch(error){
        console.log(error);
        res.json(500,'Backend Hatası');
    }
  
};

exports.updateStatus = async (req, res) => {
    const { productId } = req.params; // URL'den productId'yi alıyoruz
    const { status } = req.body; // Body'den showcase durumunu alıyoruz
  
    try {
      // Belirli ürünü bulup showcase durumunu güncelleme
      const product = await Products.findByPk(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Ürün bulunamadı!' });
      }
  
      // Ürünün showcase durumunu güncelle
      product.is_available = status;
      await product.save();
  
      return res.status(200).json({ message: 'Vitrin durumu başarıyla güncellendi.', product });
    } catch (error) {
      console.error('Vitrin durumu güncellenirken bir hata oluştu:', error);
      return res.status(500).json({ message: 'Vitrin durumu güncellenirken bir hata oluştu.' });
    }
};

const stringSimilarity = require('string-similarity');

exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Lütfen bir Excel dosyası yükleyin.' });
    }

    const columnMapping = {
      "Ürün Adı": "product_name",
      "Fiyat": "price",
      "Kategori": "category_name",
      "Açıklama": "description",
      "Stok": "stock",
      "Seçili": "is_selected",
      "Mevcut": "is_available",
      "Resim": "image_url",
      "Kalori": "calorie_count",
      "Pişirme Süresi": "cooking_time"
    };

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet);

    if (rawData.length === 0) {
      return res.status(400).json({ message: 'Excel dosyası boş.' });
    }

    const unknownColumns = Object.keys(rawData[0]).filter(
      col => !columnMapping[col.trim()]
    );
    
    if (unknownColumns.length > 0) {
      return res.status(400).json({
        message: "Bilinmeyen sütun başlıkları tespit edildi.",
        unknownColumns
      });
    }

    const data = rawData.map(item => {
      const mappedItem = {};
      for (const key in item) {
        const mappedKey = columnMapping[key.trim()];
        if (mappedKey) {
          mappedItem[mappedKey] = item[key];
        }
      }
      return mappedItem;
    });

    const missingFields = [];
    data.forEach((item, index) => {
      if (!item.product_name) missingFields.push(`Satır ${index + 1}: Ürün adı eksik`);
      if (!item.price) missingFields.push(`Satır ${index + 1}: Fiyat eksik`);
      if (!item.category_name) missingFields.push(`Satır ${index + 1}: Kategori adı eksik`);
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Zorunlu alanlar eksik:',
        details: missingFields
      });
    }

    const count = await Products.count();
    const duplicateProducts = [];
    const successfulProducts = [];
    const categoryErrors = [];

    // 🧠 Kategorileri başta çekip bellekten kontrol edeceğiz
    const allCategories = await Category.findAll();
    const allCategoryNames = allCategories.map(cat =>
      cat.category_name.toString().trim().toLowerCase()
    );

    // 🧠 Tüm ürünler belleğe alınıyor
    const allProducts = await Products.findAll();
    const allProductNames = allProducts.map(p =>
      p.product_name.toString().trim().toLowerCase()
    );

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const incomingName = item.product_name.toString().trim().toLowerCase();

      // 🔍 Benzer ürün var mı?
      let matchedProduct = allProducts.find(p =>
        p.product_name.toString().trim().toLowerCase() === incomingName
      );

      if (!matchedProduct) {
        const { bestMatch } = stringSimilarity.findBestMatch(incomingName, allProductNames);
        const bestMatchName = bestMatch.target;
        const bestRating = bestMatch.rating;

        if (bestRating > 0.6) {
          matchedProduct = allProducts.find(p =>
            p.product_name.toString().trim().toLowerCase() === bestMatchName
          );
        }
      }

      if (matchedProduct) {
        duplicateProducts.push(`${item.product_name} (benzer: ${matchedProduct.product_name})`);
        continue;
      }

      const categoryName = item.category_name.toString().trim().toLowerCase();
      let matchedCategory = allCategories.find(cat =>
        cat.category_name.toString().trim().toLowerCase() === categoryName
      );

      if (!matchedCategory) {
        const { bestMatch } = stringSimilarity.findBestMatch(categoryName, allCategoryNames);
        const bestMatchName = bestMatch.target;
        const bestCategory = allCategories.find(cat =>
          cat.category_name.toString().trim().toLowerCase() === bestMatchName
        );

        if (bestMatch.rating > 0.8 && bestCategory) {
          matchedCategory = bestCategory;
        } else {
          try {
            matchedCategory = await Category.create({
              category_name: item.category_name.trim(),
              parent_id: null,
              sira_id: 0,
              depth: 0
            });
            allCategories.push(matchedCategory);
            allCategoryNames.push(matchedCategory.category_name.trim().toLowerCase());
          } catch (catErr) {
            categoryErrors.push(`Satır ${i + 1}: ${item.category_name} kategorisi oluşturulamadı.`);
            continue;
          }
        }
      }

      try {
        await Products.create({
          product_name: item.product_name,
          price: item.price,
          category_id: matchedCategory.category_id,
          description: item.description || null,
          is_selected: item.is_selected || false,
          is_available: item.is_available === undefined ? true : item.is_available,
          sira_id: count + successfulProducts.length + 1,
          image_url: item.image_url || null,
          calorie_count: item.calorie_count || null,
          cooking_time: item.cooking_time || null,
          stock: item.stock || null,
          carbs: item.carbs || null,
          protein: item.protein || null,
          fat: item.fat || null,
          allergens: item.allergens || null,
          recommended_with: item.recommended_with || null,
          business_id: 8
        });

        successfulProducts.push(item.product_name);
      } catch (createErr) {
        categoryErrors.push(`Satır ${i + 1}: ${item.product_name} ürünü eklenemedi.`);
      }
    }

   let responseMessage = '';
let statusCode = 200;

if (successfulProducts.length === 0) {
  responseMessage = 'Hiçbir ürün eklenmedi. Tüm ürünler sistemde zaten mevcut veya hatalıydı.';
  statusCode = 400; // bad request gibi davran
} else if (duplicateProducts.length > 0 || categoryErrors.length > 0) {
  responseMessage = 'Bazı ürünler eklendi fakat bazıları atlandı.';
} else {
  responseMessage = 'Excel yüklemesi tamamlandı.';
}

res.status(statusCode).json({
  message: responseMessage,
  addedProducts: successfulProducts,
  duplicateProducts,
  categoryErrors,
  addedCount: successfulProducts.length,
  duplicateCount: duplicateProducts.length
});

  } catch (error) {
    console.error('Excel dosyası yüklenirken bir hata oluştu:', error);
    res.status(500).json({
      message: 'Excel dosyası yüklenirken bir hata oluştu.',
      error: error.message
    });
  }
};

// Resim güncelleme fonksiyonu
exports.updateProductImage = async (req, res) => {
    try {
        const { product_id, removeImage } = req.body;
        const imageFile = req.file;

        let imageUrl = null;

        // Eğer resim kaldırılacaksa
        if (removeImage === 'true') {
            imageUrl = null;
        }
        // Eğer yeni resim yüklenecekse
        else if (imageFile) {
            imageUrl = imageFile.filename;
        }
        // Eğer hiçbir değişiklik yoksa mevcut resmi koru
        else {
            // Mevcut ürünü bul ve resmini koru
            const existingProduct = await Products.findByPk(product_id);
            if (existingProduct) {
                imageUrl = existingProduct.image_url;
            }
        }

        // Ürünü güncelle
        await Products.update(
            { image_url: imageUrl },
            { where: { product_id: product_id } }
        );

        res.json({ 
            message: 'Ürün resmi başarıyla güncellendi',
            image_url: imageUrl 
        });
    } catch (error) {
        console.error('Resim güncelleme hatası:', error);
        res.status(500).json({ error: 'Resim güncellenirken bir hata oluştu' });
    }
};

// Kategori sıralama endpoint'i
exports.updateCategoriesSira = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ error: 'Kategoriler listesi gerekli' });
    }

    // Her kategori için sira_id'yi güncelle
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      await Category.update(
        { sira_id: i + 1 },
        { where: { category_id: category.category_id } }
      );
    }

    res.json({ 
      message: 'Kategori sıralaması başarıyla güncellendi',
      updatedCount: categories.length 
    });
  } catch (error) {
    console.error('Kategori sıralama hatası:', error);
    res.status(500).json({ error: 'Kategori sıralaması güncellenirken bir hata oluştu' });
  }
};

// Belirli bir ürünün önerilen ürünlerinin detaylarını getir
exports.getRecommendedProductsData = async (req, res) => {
  try {
    const { product_id } = req.params;
    console.log(`🔄 Ürün ID ${product_id} için önerilen ürünler getiriliyor...`);
    
    // Önce ana ürünü bul ve recommended_with alanını al
    const mainProduct = await Products.findByPk(product_id, {
      attributes: ['product_id', 'product_name', 'recommended_with']
    });
    
    if (!mainProduct) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    // Eğer recommended_with alanı boşsa boş array döndür
    if (!mainProduct.recommended_with) {
      console.log('❌ Bu ürün için önerilen ürün yok');
      return res.json([]);
    }
    
    // JSON string'i parse et
    let recommendedIds;
    try {
      recommendedIds = JSON.parse(mainProduct.recommended_with);
    } catch (e) {
      console.error('❌ recommended_with JSON parse hatası:', e);
      return res.json([]);
    }
    
    // Eğer array değilse veya boşsa
    if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
      console.log('❌ Geçerli önerilen ürün ID\'si yok');
      return res.json([]);
    }
    
    console.log('🔍 Önerilen ürün ID\'leri:', recommendedIds);
    
    // Önerilen ürünlerin detaylarını getir
    const recommendedProducts = await Products.findAll({
      attributes: ['product_id', 'product_name', 'is_available'],
      where: {
        product_id: {
          [Op.in]: recommendedIds
        }
      },
      order: [['product_name', 'ASC']]
    });
    
    console.log(`✅ ${recommendedProducts.length} önerilen ürün bulundu`);
    
    res.json(recommendedProducts);
  } catch (error) {
    console.error('❌ Önerilen ürünler getirme hatası:', error);
    res.status(500).json({ error: 'Önerilen ürünler alınamadı' });
  }
};