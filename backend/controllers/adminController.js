const Products = require('../models/Products');
const Category = require('../models/Category');
const Business = require('../models/Business');
const { Label, ProductLabel, ProductTranslation, CategoryTranslation, Portion, Ingredient, RecommendedProduct } = require('../models');
const xlsx = require('xlsx');
const { Op } = require("sequelize");
const sequelize = require('../db');
const { hasPermission } = require('../utils/permissionUtils');
const { deleteImage, getImageUrl } = require('../middleware/uploadMiddleware');
const { CloudflareService } = require('../middleware/cloudflareMiddleware');


exports.updateImageUrl = async (req, res) => {
    const {productId } = req.body;
    const imageUrl = req.file.filename;
    
    // Cloudflare bilgilerini al
    const cloudUrl = req.file.cloudUrl || null;
    const cloudPath = req.file.cloudPath || null;
    const compressionStats = req.file.compressionStats || null;
    
    console.log('☁️ updateImageUrl - Cloudflare bilgileri:', {
        productId,
        imageUrl,
        cloudUrl,
        cloudPath
    });

    // Sıkıştırma istatistiklerini logla
    if (compressionStats) {
        if (compressionStats.compressed) {
            console.log('📊 Görsel Sıkıştırma İstatistikleri:');
            console.log(`   • Orijinal Boyut: ${compressionStats.originalSizeKB.toFixed(2)} KB`);
            console.log(`   • Sıkıştırılmış Boyut: ${compressionStats.finalSizeKB.toFixed(2)} KB`);
            console.log(`   • Tasarruf Oranı: %${compressionStats.compressionRatio}`);
            console.log(`   • İşlem Süresi: ${compressionStats.processingTime}ms`);
            console.log(`   • Deneme Sayısı: ${compressionStats.attempts}`);
        } else {
            console.log('ℹ️ Görsel zaten optimize edilmiş, sıkıştırma atlandı');
        }
    }

    try {
        // Önce eski ürünü bul ve eski görseli Cloudflare'den sil
        const existingProduct = await Products.findOne({
            where: { product_id: productId }
        });

        if (existingProduct && existingProduct.cloudpath) {
            const cloudflareService = new CloudflareService();
            try {
                await cloudflareService.deleteFile(existingProduct.cloudpath);
                console.log(`✅ Eski ürün görseli Cloudflare'den silindi: ${existingProduct.cloudpath}`);
            } catch (cloudflareError) {
                console.error(`⚠️ Cloudflare'den eski görsel silinemedi: ${cloudflareError.message}`);
                // Hata olsa bile işleme devam et
            }
        }

        const result = await Products.update({ 
            image_url: imageUrl,
            cloudurl: cloudUrl,
            cloudpath: cloudPath
        }, { 
            where: { product_id: productId } 
        });
        
        res.json({
            success: true,
            image_url: imageUrl,
            cloudUrl: cloudUrl,
            cloudPath: cloudPath,
            compressionStats: compressionStats
        });
    } catch (err) {
        console.error('❌ Resim güncelleme hatası:', err);
        res.status(500).json("Internal Server Error");
    }
}


// Tüm ürünleri getir
exports.getAllProuducts = async (req, res) => {
  try {
    const products = await Products.findAll({
      where: {
        business_id: req.user.business_id
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'category_name'],
          where: {
            business_id: req.user.business_id
          }
        },
        {
          model: Label,
          as: 'labels',
          attributes: ['label_id', 'name', 'color'],
          through: { attributes: [] }, // ProductLabel junction tablosundan hiçbir alan almayız
          required: false,
          where: {
            business_id: req.user.business_id
          }
        }
      ]
    });
    
    res.json(products);
  } catch (error) {
    console.error('❌ Ürün getirme hatası:', error);
    res.status(500).json({ error: 'Ürünler alınamadı' });
  }
};
exports.getAllProductsOrderBySiraId = async (req,res) => {
    try {
        const { language_code } = req.query;
        
        let includeOptions = [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'category_name'],
                where: {
                    business_id: req.user.business_id
                }
            }
        ];
        
        // Eğer dil kodu belirtilmişse çevirileri de getir
        if (language_code) {
            includeOptions.push({
                model: ProductTranslation,
                as: 'translations',
                where: { 
                    language_code,
                    business_id: req.user.business_id
                },
                required: false,
                attributes: ['product_name', 'description', 'allergens', 'recommended_with']
            });
            
            includeOptions.push({
                model: CategoryTranslation,
                as: 'translations',
                where: { 
                    language_code,
                    business_id: req.user.business_id
                },
                required: false,
                attributes: ['category_name']
            });
        }
        
        const products = await Products.findAll({
            where: {
                business_id: req.user.business_id
            },
            include: includeOptions,
            order:[['sira_id','ASC']]
        });
        
        // Çeviri varsa ana alanları çeviri ile değiştir
        const translatedProducts = products.map(product => {
            const productData = product.toJSON();
            
            if (language_code && product.translations && product.translations.length > 0) {
                const translation = product.translations[0];
                if (translation.product_name) {
                    productData.product_name = translation.product_name;
                }
                if (translation.description) {
                    productData.description = translation.description;
                }
                if (translation.allergens) {
                    productData.allergens = translation.allergens;
                }
                if (translation.recommended_with) {
                    productData.recommended_with = translation.recommended_with;
                }
            }
            
            if (language_code && product.category && product.category.translations && product.category.translations.length > 0) {
                const categoryTranslation = product.category.translations[0];
                if (categoryTranslation.category_name) {
                    productData.category.category_name = categoryTranslation.category_name;
                }
            }
            
            return productData;
        });
        
        res.json(translatedProducts);
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
        
        // Cloudflare URL ve path bilgilerini al
        const cloudUrl = req.file && req.file.cloudUrl ? req.file.cloudUrl : null;
        const cloudPath = req.file && req.file.cloudPath ? req.file.cloudPath : null;
        const compressionStats = req.file && req.file.compressionStats ? req.file.compressionStats : null;

        console.log('🔍 Request body:', req.body);
        console.log('🏷️ Labels raw:', labels);
        console.log('🏷️ Labels type:', typeof labels);
        console.log('☁️ Cloudflare URL:', cloudUrl);
        console.log('☁️ Cloudflare Path:', cloudPath);

        // Sıkıştırma istatistiklerini logla
        if (compressionStats) {
            if (compressionStats.compressed) {
                console.log('📊 Ürün Görseli Sıkıştırma İstatistikleri:');
                console.log(`   • Orijinal Boyut: ${compressionStats.originalSizeKB.toFixed(2)} KB`);
                console.log(`   • Sıkıştırılmış Boyut: ${compressionStats.finalSizeKB.toFixed(2)} KB`);
                console.log(`   • Tasarruf Oranı: %${compressionStats.compressionRatio}`);
                console.log(`   • İşlem Süresi: ${compressionStats.processingTime}ms`);
            } else {
                console.log('ℹ️ Görsel zaten optimize edilmiş, sıkıştırma atlandı');
            }
        }

        if (!name || !price || !category_id) {
            return res.status(400).json({ error: "Zorunlu alanlar eksik" });
        }

        const existingProduct = await Products.findOne({ 
            where: { product_name: name, business_id: req.user.business_id } 
        });
        if (existingProduct) {
            return res.status(400).json({ error: "Bu ürün zaten mevcut" }); 
        }

        const count = await Products.count({
            where: {
                business_id: req.user.business_id
            }
        });
        
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
            cloudurl: cloudUrl,  // Cloudflare URL'ini kaydet (küçük harfle)
            cloudpath: cloudPath, // Cloudflare Path'ini kaydet (küçük harfle)
            business_id: req.user.business_id,
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
                        label_id: labelIds,
                        business_id: req.user.business_id
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
    const cloudflareService = new CloudflareService();

    // Önce ürünü bul ve resim bilgisini al
    const product = await Products.findOne({
      where: {
        product_id: id,
        business_id: req.user.business_id
      }
    });
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    // Cloudflare'den resmi sil (eğer varsa)
    if (product.cloudpath) {
      try {
        await cloudflareService.deleteFile(product.cloudpath);
        console.log(`✅ Cloudflare'den ürün görseli silindi: ${product.cloudpath}`);
      } catch (cloudflareError) {
        console.error(`⚠️ Cloudflare'den görsel silinemedi: ${cloudflareError.message}`);
        // Cloudflare hatası olsa bile işleme devam et
      }
    }

    // Yerel diskten resmi sil (eğer varsa)
    if (product.image_url) {
      const imagePath = `public/images/${product.image_url}`;
      deleteImage(imagePath);
    }

    // Tüm bağımlı kayıtları sil
    console.log(`🗑️ Ürün siliniyor (ID: ${id}), bağımlılıklar temizleniyor...`);
    
    // 1. Ürün çevirilerini sil
    await ProductTranslation.destroy({
      where: { product_id: id }
    });
    console.log('✅ Ürün çevirileri silindi');

    // 2. Ürün etiketlerini sil
    await ProductLabel.destroy({
      where: { product_id: id }
    });
    console.log('✅ Ürün etiketleri silindi');

    // 3. Önerilen ürün ilişkilerini sil (hem kaynak hem hedef olarak)
    await RecommendedProduct.destroy({
      where: {
        [Op.or]: [
          { product_id: id },
          { recommended_product_id: id }
        ]
      }
    });
    console.log('✅ Önerilen ürün ilişkileri silindi');

    // 4. Porsiyonları sil
    await Portion.destroy({
      where: { product_id: id }
    });
    console.log('✅ Porsiyonlar silindi');

    // 5. Malzemeleri sil
    await Ingredient.destroy({
      where: { product_id: id }
    });
    console.log('✅ Malzemeler silindi');

    // 6. Şube ürün ilişkilerini sil
    const BranchProduct = require('../models/BranchProduct');
    await BranchProduct.destroy({
      where: { product_id: id }
    });
    console.log('✅ Şube ürün ilişkileri silindi');

    // 7. Son olarak ürünü sil
    const deleted = await Products.destroy({
      where: { 
        product_id: id,
        business_id: req.user.business_id
      }
    });

    console.log('✅ Ürün başarıyla silindi');
    res.status(200).json({ success: true, message: 'Ürün ve tüm bağımlılıkları başarıyla silindi' });
  } catch (error) {
    console.error('❌ Ürün silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
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
            where: { 
                product_id: id,
                business_id: req.user.business_id
            }
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
                        label_id: labels,
                        business_id: req.user.business_id
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
        const updatedProduct = await Products.findOne({
            where: {
                product_id: id,
                business_id: req.user.business_id
            },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['category_id', 'category_name'],
                    where: {
                        business_id: req.user.business_id
                    }
                },
                {
                    model: Label,
                    as: 'labels',
                    attributes: ['label_id', 'name', 'color'],
                    through: { attributes: [] },
                    required: false,
                    where: {
                        business_id: req.user.business_id
                    }
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
        const { language_code } = req.query;
        
        let includeOptions = [];
        
        // Eğer dil kodu belirtilmişse çevirileri de getir
        if (language_code) {
            includeOptions.push({
                model: CategoryTranslation,
                as: 'translations',
                where: { 
                    language_code,
                    business_id: req.user.business_id
                },
                required: false,
                attributes: ['category_name']
            });
        }
        
        const categories = await Category.findAll({
            where: {
                business_id: req.user.business_id
            },
            include: includeOptions,
            order: [['sira_id', 'ASC']]
        });
        
        // Çeviri varsa ana alanları çeviri ile değiştir
        const translatedCategories = categories.map(category => {
            const categoryData = category.toJSON();
            
            if (language_code && category.translations && category.translations.length > 0) {
                const translation = category.translations[0];
                if (translation.category_name) {
                    categoryData.category_name = translation.category_name;
                }
            }
            
            return categoryData;
        });
        
        res.json(translatedCategories);
    } catch (error) {
        console.error('❌ Kategoriler getirme hatası:', error);
        res.status(500).json({ error: 'Kategoriler alınamadı' });
    }
}

// Sadece kategori listesi için (yetki kontrolü olmadan) - CategorySelector için
exports.getCategoriesList = async (req, res) => {
    try {
        const { language_code } = req.query;
        let includeOptions = [];
        
        // Eğer dil kodu belirtilmişse çevirileri de getir
        if (language_code) {
            includeOptions.push({
                model: CategoryTranslation,
                as: 'translations',
                where: { 
                    language_code,
                    business_id: req.user.business_id
                },
                required: false,
                attributes: ['category_name']
            });
        }
        
        const categories = await Category.findAll({
            where: {
                business_id: req.user.business_id
            },
            attributes: ['category_id', 'category_name'],
            include: includeOptions,
            order: [['sira_id', 'ASC']]
        });
        
        // Çeviri varsa ana alanları çeviri ile değiştir
        const translatedCategories = categories.map(category => {
            const categoryData = category.toJSON();
            
            if (language_code && category.translations && category.translations.length > 0) {
                const translation = category.translations[0];
                if (translation.category_name) {
                    categoryData.category_name = translation.category_name;
                }
            }
            
            return categoryData;
        });
        
        res.json(translatedCategories);
    } catch (error) {
        console.error('❌ Kategori listesi hatası:', error);
        res.status(500).json({ error: "Kategoriler alınamadı" });
    }
}

// Kategori silme endpointi
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const cloudflareService = new CloudflareService();

    // Önce kategoriyi bul
    const category = await Category.findOne({
      where: {
        category_id: id,
        business_id: req.user.business_id
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    // Kategoriye bağlı ürün kontrolü
    const productCount = await Products.count({ 
      where: { 
        category_id: id,
        business_id: req.user.business_id
      } 
    });
    if (productCount > 0) {
      return res.status(400).json({ error: 'Bu kategoriye bağlı ürünler var, önce ürünleri silin veya başka kategoriye taşıyın.' });
    }

    console.log(`🗑️ Kategori siliniyor (ID: ${id}), bağımlılıklar temizleniyor...`);
    
    // Cloudflare'den resmi sil (eğer varsa)
    if (category.cloudpath) {
      try {
        await cloudflareService.deleteFile(category.cloudpath);
        console.log(`✅ Cloudflare'den kategori görseli silindi: ${category.cloudpath}`);
      } catch (cloudflareError) {
        console.error(`⚠️ Cloudflare'den görsel silinemedi: ${cloudflareError.message}`);
        // Cloudflare hatası olsa bile işleme devam et
      }
    }

    // Yerel diskten resmi sil (eğer varsa)
    if (category.image_url) {
      const imagePath = `public/images/${category.image_url}`;
      deleteImage(imagePath);
    }
    
    // Kategori çevirilerini sil
    await CategoryTranslation.destroy({
      where: { category_id: id }
    });
    console.log('✅ Kategori çevirileri silindi');

    // Kategoriyi sil
    const deleted = await Category.destroy({ 
      where: { 
        category_id: id,
        business_id: req.user.business_id
      } 
    });
    
    if (deleted) {
      console.log('✅ Kategori başarıyla silindi');
      res.json({ message: 'Kategori ve çevirileri başarıyla silindi' });
    } else {
      res.status(404).json({ error: 'Kategori bulunamadı' });
    }
  } catch (error) {
    console.error('❌ Kategori silme hatası:', error);
    res.status(500).json({ error: 'Silme işlemi başarısız: ' + error.message });
  }
};


// Kategori oluştururken parent_id desteği
exports.createCategory = async (req, res) => {
  try {
    const { category_name, parent_id } = req.body;
    const image_url = req.file ? req.file.filename : null;
    
    // Cloudflare bilgilerini al
    const cloudUrl = req.file && req.file.cloudUrl ? req.file.cloudUrl : null;
    const cloudPath = req.file && req.file.cloudPath ? req.file.cloudPath : null;
    
    console.log('☁️ Kategori oluşturma - Cloudflare bilgileri:', {
        cloudUrl,
        cloudPath
    });
    
    if (!category_name) {
      return res.status(400).json({ error: "Kategori adı boş olamaz!" });
    }
    const category = await Category.create({
      category_name: category_name,
      sira_id: 0,
      parent_id: parent_id ? parseInt(parent_id) : null,
      image_url: image_url,
      cloudurl: cloudUrl,  // Cloudflare URL'ini kaydet (küçük harfle)
      cloudpath: cloudPath, // Cloudflare Path'ini kaydet (küçük harfle)
      business_id: req.user.business_id
    });
    res.json(category);
  } catch (error) {
    console.error('Kategori oluşturma hatası:', error);
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
      parent_id: parentId || null,
      business_id: req.user.business_id
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
                parent_id: id,
                business_id: req.user.business_id
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
                category_id: id,
                business_id: req.user.business_id
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
        where: {
          business_id: req.user.business_id
        },
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
    let cloudUrl = null;
    let cloudPath = null;

    // Önce mevcut kategoriyi bul
    const existingCategory = await Category.findOne({
      where: { 
        category_id: category_id,
        business_id: req.user.business_id
      }
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    // Eğer resim kaldırılacaksa veya yeni resim yüklenecekse eski görseli sil
    if ((removeImage === 'true' || imageFile) && existingCategory.cloudpath) {
      const cloudflareService = new CloudflareService();
      try {
        await cloudflareService.deleteFile(existingCategory.cloudpath);
        console.log(`✅ Eski kategori görseli Cloudflare'den silindi: ${existingCategory.cloudpath}`);
      } catch (cloudflareError) {
        console.error(`⚠️ Cloudflare'den eski görsel silinemedi: ${cloudflareError.message}`);
        // Hata olsa bile işleme devam et
      }
    }

    // Eğer resim kaldırılacaksa
    if (removeImage === 'true') {
      imageUrl = null;
      cloudUrl = null;
      cloudPath = null;
    }
    // Eğer yeni resim yüklenecekse
    else if (imageFile) {
      imageUrl = imageFile.filename;
      // Cloudflare bilgilerini al
      cloudUrl = imageFile.cloudUrl || null;
      cloudPath = imageFile.cloudPath || null;
      
      console.log('☁️ Kategori güncelleme - Cloudflare bilgileri:', {
          cloudUrl,
          cloudPath
      });
    }
    // Eğer hiçbir değişiklik yoksa mevcut resmi koru
    else {
      imageUrl = existingCategory.image_url;
      cloudUrl = existingCategory.cloudurl;
      cloudPath = existingCategory.cloudpath;
    }

    // Kategoriyi güncelle
    await Category.update(
      { 
        category_name: category_name,
        image_url: imageUrl,
        cloudurl: cloudUrl,
        cloudpath: cloudPath
      },
      { 
        where: { 
          category_id: category_id,
          business_id: req.user.business_id
        } 
      }
    );

    res.json({ 
      message: 'Kategori başarıyla güncellendi',
      image_url: imageUrl,
      cloudUrl: cloudUrl,
      cloudPath: cloudPath
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
            product_id:product_id,
            business_id: req.user.business_id
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
          business_id: req.user.business_id
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
  
      const products = await Products.findAll({ 
        where: { 
          category_id,
          business_id: req.user.business_id
        } 
      });
  
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
    const product = await Products.findOne({
      where: {
        product_id: productId,
        business_id: req.user.business_id
      }
    });
    
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
      const product = await Products.findOne({
        where: {
          product_id: productId,
          business_id: req.user.business_id
        }
      });
      
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
        console.log(`⚠️ Duplicate ürün bulundu: ${item.product_name}`);
        duplicateProducts.push(`${item.product_name} (benzer: ${matchedProduct.product_name})`);
        continue;
      }

      const categoryName = item.category_name.toString().trim().toLowerCase();
      let matchedCategory = allCategories.find(cat =>
        cat.category_name.toString().trim().toLowerCase() === categoryName
      );

      if (!matchedCategory) {
        console.log(`🔍 Kategori bulunamadı, benzerlik aranıyor: ${item.category_name}`);
        const { bestMatch } = stringSimilarity.findBestMatch(categoryName, allCategoryNames);
        const bestMatchName = bestMatch.target;
        const bestCategory = allCategories.find(cat =>
          cat.category_name.toString().trim().toLowerCase() === bestMatchName
        );

        if (bestMatch.rating > 0.8 && bestCategory) {
          console.log(`✅ Benzer kategori bulundu: ${bestCategory.category_name} (rating: ${bestMatch.rating})`);
          matchedCategory = bestCategory;
        } else {
          console.log(`🆕 Yeni kategori oluşturuluyor: ${item.category_name}`);
          try {
            matchedCategory = await Category.create({
              category_name: item.category_name.trim(),
              parent_id: null,
              sira_id: 0,
              depth: 0
            });
            allCategories.push(matchedCategory);
            allCategoryNames.push(matchedCategory.category_name.trim().toLowerCase());
            console.log(`✅ Yeni kategori oluşturuldu: ${matchedCategory.category_name}`);
          } catch (catErr) {
            console.error(`❌ Kategori oluşturma hatası:`, catErr);
            categoryErrors.push(`Satır ${i + 1}: ${item.category_name} kategorisi oluşturulamadı.`);
            continue;
          }
        }
      }

      try {
        console.log(`💾 Ürün oluşturuluyor: ${item.product_name}`);
        
        // Kullanıcının business_id'sini al
        const userBusinessId = req.user.business_id;
        console.log(`🏢 Kullanıcının business_id: ${userBusinessId}`);
        
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
          business_id: userBusinessId // Hardcoded 8 yerine kullanıcının business_id'si
        });

        successfulProducts.push(item.product_name);
        console.log(`✅ Ürün başarıyla oluşturuldu: ${item.product_name}`);
      } catch (createErr) {
        console.error(`❌ Ürün oluşturma hatası:`, createErr);
        categoryErrors.push(`Satır ${i + 1}: ${item.product_name} ürünü eklenemedi.`);
      }
    }

   console.log('📊 İşlem sonuçları:');
   console.log('✅ Başarılı ürünler:', successfulProducts.length);
   console.log('⚠️ Duplicate ürünler:', duplicateProducts.length);
   console.log('❌ Kategori hataları:', categoryErrors.length);

   let responseMessage = '';
let statusCode = 200;

if (successfulProducts.length === 0) {
  responseMessage = 'Hiçbir ürün eklenmedi. Tüm ürünler sistemde zaten mevcut veya hatalıydı.';
  statusCode = 400; // bad request gibi davran
  console.log('❌ Hiçbir ürün eklenmedi, 400 status döndürülüyor');
} else if (duplicateProducts.length > 0 || categoryErrors.length > 0) {
  responseMessage = 'Bazı ürünler eklendi fakat bazıları atlandı.';
  console.log('⚠️ Kısmi başarı, 200 status döndürülüyor');
} else {
  responseMessage = 'Excel yüklemesi tamamlandı.';
  console.log('✅ Tam başarı, 200 status döndürülüyor');
}

console.log('📤 Response gönderiliyor:', {
  statusCode,
  message: responseMessage,
  addedCount: successfulProducts.length
});

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
        let cloudUrl = null;
        let cloudPath = null;

        // Önce mevcut ürünü bul
        const existingProduct = await Products.findByPk(product_id);
        
        if (!existingProduct) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        // Eğer resim kaldırılacaksa veya yeni resim yüklenecekse eski görseli sil
        if ((removeImage === 'true' || imageFile) && existingProduct.cloudpath) {
            const cloudflareService = new CloudflareService();
            try {
                await cloudflareService.deleteFile(existingProduct.cloudpath);
                console.log(`✅ Eski ürün görseli Cloudflare'den silindi: ${existingProduct.cloudpath}`);
            } catch (cloudflareError) {
                console.error(`⚠️ Cloudflare'den eski görsel silinemedi: ${cloudflareError.message}`);
                // Hata olsa bile işleme devam et
            }
        }

        // Eğer resim kaldırılacaksa
        if (removeImage === 'true') {
            imageUrl = null;
            cloudUrl = null;
            cloudPath = null;
        }
        // Eğer yeni resim yüklenecekse
        else if (imageFile) {
            imageUrl = imageFile.filename;
            // Cloudflare bilgilerini al
            cloudUrl = imageFile.cloudUrl || null;
            cloudPath = imageFile.cloudPath || null;
            const compressionStats = imageFile.compressionStats || null;
            
            console.log('☁️ Resim güncelleme - Cloudflare bilgileri:', {
                cloudUrl,
                cloudPath
            });

            // Sıkıştırma istatistiklerini logla
            if (compressionStats) {
                if (compressionStats.compressed) {
                    console.log('📊 Ürün Resmi Güncelleme - Sıkıştırma İstatistikleri:');
                    console.log(`   • Orijinal Boyut: ${compressionStats.originalSizeKB.toFixed(2)} KB`);
                    console.log(`   • Sıkıştırılmış Boyut: ${compressionStats.finalSizeKB.toFixed(2)} KB`);
                    console.log(`   • Tasarruf Oranı: %${compressionStats.compressionRatio}`);
                    console.log(`   • İşlem Süresi: ${compressionStats.processingTime}ms`);
                } else {
                    console.log('ℹ️ Görsel zaten optimize edilmiş, sıkıştırma atlandı');
                }
            }
        }
        // Eğer hiçbir değişiklik yoksa mevcut resmi koru
        else {
            imageUrl = existingProduct.image_url;
            cloudUrl = existingProduct.cloudurl;
            cloudPath = existingProduct.cloudpath;
        }

        // Ürünü güncelle
        await Products.update(
            { 
                image_url: imageUrl,
                cloudurl: cloudUrl,
                cloudpath: cloudPath
            },
            { 
                where: { 
                    product_id: product_id,
                    business_id: req.user.business_id
                } 
            }
        );

        res.json({ 
            message: 'Ürün resmi başarıyla güncellendi',
            image_url: imageUrl,
            cloudUrl: cloudUrl,
            cloudPath: cloudPath
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
        { 
          where: { 
            category_id: category.category_id,
            business_id: req.user.business_id
          } 
        }
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
    const mainProduct = await Products.findOne({
      where: {
        product_id: product_id,
        business_id: req.user.business_id
      },
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
        },
        business_id: req.user.business_id
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