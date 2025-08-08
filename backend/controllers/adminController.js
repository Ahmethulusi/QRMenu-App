const Products = require('../models/Products');
const Category = require('../models/Category');
const Business = require('../models/Business');
const xlsx = require('xlsx');
const { Op } = require("sequelize");
const sequelize = require('../db');

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

exports.getAllProuducts = async (req, res) => {
    try {
        console.log('🔄 Tüm ürünler getiriliyor...');
        console.log('👤 Kullanıcı:', req.user);
        
        const db = require('../models');
        const products = await Products.findAll({
            include: [
                { 
                    model: db.Category,
                    attributes: ['category_id', 'category_name']
                },
                { 
                    model: db.Business,
                    attributes: ['name'] // business_name yerine name kullanıyoruz
                },
                { 
                    model: db.Branch, 
                    through: { attributes: ['price'] },
                    as: 'Branches' // Alias ekledik
                }
            ]
        });
        
        console.log(`✅ ${products.length} ürün bulundu`);
        if (products.length > 0) {
            console.log('📦 İlk ürün örneği:', {
                product_id: products[0].product_id,
                product_name: products[0].product_name,
                category: products[0].Category ? products[0].Category.category_name : 'Yok',
                business: products[0].Business ? products[0].Business.name : 'Yok'
            });
        }
        
        res.json(products);
    } catch (error) {
        console.error('❌ Ürünler getirilirken hata:', error);
        console.error('❌ Hata detayı:', error.message);
        res.status(500).json({ error: 'Ürünler getirilirken bir hata oluştu: ' + error.message });
    }
}

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
        return res.status(400).json({ message: 'Business ID gerekli' });
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
                { model: db.Category },
                { model: db.Business },
                { 
                    model: db.Branch, 
                    through: { attributes: ['price'] } 
                }
            ]
        });
        res.json(product);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Product not found' });
    }
}

exports.createProduct = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ error: "Request body is empty" });
    }
    try {
        const { name, price, description, category_id, status, showcase } = req.body;

        if (!name || !price || !category_id) {
            return res.status(400).json({ error: "Zorunlu alanlar eksik" });
        }

        const product = await Products.create({
            name,
            price,
            description,
            category_id,
            status: status || true,
            showcase: showcase || false
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Ürün oluşturma hatası:', error);
        res.status(500).json({ error: "Ürün oluşturulamadı" });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const { product_id, name, price, description, category_id, status, showcase } = req.body;

        if (!product_id) {
            return res.status(400).json({ error: "Product ID gerekli" });
        }

        const product = await Products.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ error: "Ürün bulunamadı" });
        }

        await product.update({
            name: name || product.name,
            price: price || product.price,
            description: description || product.description,
            category_id: category_id || product.category_id,
            status: status !== undefined ? status : product.status,
            showcase: showcase !== undefined ? showcase : product.showcase
        });

        res.json(product);
    } catch (error) {
        console.error('Ürün güncelleme hatası:', error);
        res.status(500).json({ error: "Ürün güncellenemedi" });
    }
}

exports.updateProductImage = async (req, res) => {
    try {
        const { product_id } = req.body;
        const imageUrl = req.file.filename;

        if (!product_id) {
            return res.status(400).json({ error: "Product ID gerekli" });
        }

        const product = await Products.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ error: "Ürün bulunamadı" });
        }

        await product.update({ image_url: imageUrl });
        res.json(product);
    } catch (error) {
        console.error('Ürün resmi güncelleme hatası:', error);
        res.status(500).json({ error: "Ürün resmi güncellenemedi" });
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Products.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ error: "Ürün bulunamadı" });
        }

        await product.destroy();
        res.json({ message: "Ürün başarıyla silindi" });
    } catch (error) {
        console.error('Ürün silme hatası:', error);
        res.status(500).json({ error: "Ürün silinemedi" });
    }
}

exports.updateShowcase = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Products.findByPk(productId);
        
        if (!product) {
            return res.status(404).json({ error: "Ürün bulunamadı" });
        }

        await product.update({ showcase: !product.showcase });
        res.json(product);
    } catch (error) {
        console.error('Showcase güncelleme hatası:', error);
        res.status(500).json({ error: "Showcase güncellenemedi" });
    }
}

exports.updateStatus = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Products.findByPk(productId);
        
        if (!product) {
            return res.status(404).json({ error: "Ürün bulunamadı" });
        }

        await product.update({ status: !product.status });
        res.json(product);
    } catch (error) {
        console.error('Status güncelleme hatası:', error);
        res.status(500).json({ error: "Status güncellenemedi" });
    }
}

exports.updateProductPrices = async (req, res) => {
    try {
        const { products } = req.body;
        
        for (const product of products) {
            await Products.update(
                { price: product.price },
                { where: { product_id: product.product_id } }
            );
        }
        
        res.json({ message: "Fiyatlar güncellendi" });
    } catch (error) {
        console.error('Fiyat güncelleme hatası:', error);
        res.status(500).json({ error: "Fiyatlar güncellenemedi" });
    }
}

exports.bulkCreatePrices = async (req, res) => {
    try {
        const { products } = req.body;
        
        for (const product of products) {
            await Products.update(
                { price: product.price },
                { where: { product_id: product.product_id } }
            );
        }
        
        res.json({ message: "Toplu fiyat güncelleme tamamlandı" });
    } catch (error) {
        console.error('Toplu fiyat güncelleme hatası:', error);
        res.status(500).json({ error: "Toplu fiyat güncelleme başarısız" });
    }
}

// Kategori işlemleri
exports.createCategory = async (req, res) => {
    try {
        const { name, description, parent_id } = req.body;
        const imageUrl = req.file ? req.file.filename : null;

        if (!name) {
            return res.status(400).json({ error: "Kategori adı gerekli" });
        }

        const category = await Category.create({
            category_name: name,
            description,
            parent_id: parent_id || null,
            image_url: imageUrl
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Kategori oluşturma hatası:', error);
        res.status(500).json({ error: "Kategori oluşturulamadı" });
    }
}

exports.createSubCategory = async (req, res) => {
    try {
        const { name, description, parent_id } = req.body;

        if (!name || !parent_id) {
            return res.status(400).json({ error: "Kategori adı ve parent ID gerekli" });
        }

        const category = await Category.create({
            category_name: name,
            description,
            parent_id
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Alt kategori oluşturma hatası:', error);
        res.status(500).json({ error: "Alt kategori oluşturulamadı" });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const { category_id } = req.params;
        const { name, description, parent_id } = req.body;
        const imageUrl = req.file ? req.file.filename : null;

        const category = await Category.findByPk(category_id);
        if (!category) {
            return res.status(404).json({ error: "Kategori bulunamadı" });
        }

        await category.update({
            category_name: name || category.category_name,
            description: description || category.description,
            parent_id: parent_id || category.parent_id,
            image_url: imageUrl || category.image_url
        });

        res.json(category);
    } catch (error) {
        console.error('Kategori güncelleme hatası:', error);
        res.status(500).json({ error: "Kategori güncellenemedi" });
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        
        if (!category) {
            return res.status(404).json({ error: "Kategori bulunamadı" });
        }

        await category.destroy();
        res.json({ message: "Kategori başarıyla silindi" });
    } catch (error) {
        console.error('Kategori silme hatası:', error);
        res.status(500).json({ error: "Kategori silinemedi" });
    }
}

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['sira_id', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        console.error('Kategori listeleme hatası:', error);
        res.status(500).json({ error: "Kategoriler alınamadı" });
    }
}

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        
        if (!category) {
            return res.status(404).json({ error: "Kategori bulunamadı" });
        }
        
        res.json(category);
    } catch (error) {
        console.error('Kategori getirme hatası:', error);
        res.status(500).json({ error: "Kategori alınamadı" });
    }
}

exports.getSubCategoriesByParentId = async (req, res) => {
    try {
        const { id } = req.params;
        const subCategories = await Category.findAll({
            where: { parent_id: id },
            order: [['sira_id', 'ASC']]
        });
        res.json(subCategories);
    } catch (error) {
        console.error('Alt kategori listeleme hatası:', error);
        res.status(500).json({ error: "Alt kategoriler alınamadı" });
    }
}

exports.getLastCategory = async (req, res) => {
    try {
        const lastCategory = await Category.findOne({
            order: [['category_id', 'DESC']]
        });
        res.json(lastCategory);
    } catch (error) {
        console.error('Son kategori getirme hatası:', error);
        res.status(500).json({ error: "Son kategori alınamadı" });
    }
}

exports.updateCategoriesSira = async (req, res) => {
    try {
        const { categories } = req.body;
        
        for (let i = 0; i < categories.length; i++) {
            await Category.update(
                { sira_id: i + 1 },
                { where: { category_id: categories[i].category_id } }
            );
        }
        
        res.json({ message: "Kategori sıralaması güncellendi" });
    } catch (error) {
        console.error('Kategori sıralama hatası:', error);
        res.status(500).json({ error: "Kategori sıralaması güncellenemedi" });
    }
}

exports.getProductsByCategory = async (req, res) => {
    try {
        const { category_id } = req.params;
        const products = await Products.findAll({
            where: { category_id },
            include: [{ model: Category }]
        });
        res.json(products);
    } catch (error) {
        console.error('Kategori ürünleri getirme hatası:', error);
        res.status(500).json({ error: "Kategori ürünleri alınamadı" });
    }
}

// Excel upload fonksiyonu
exports.uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Excel dosyası gerekli" });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        for (const row of data) {
            if (row.name && row.price && row.category_id) {
                await Products.create({
                    name: row.name,
                    price: row.price,
                    description: row.description || '',
                    category_id: row.category_id,
                    status: row.status !== undefined ? row.status : true,
                    showcase: row.showcase !== undefined ? row.showcase : false
                });
            }
        }

        res.json({ message: "Excel dosyası başarıyla yüklendi", count: data.length });
    } catch (error) {
        console.error('Excel upload hatası:', error);
        res.status(500).json({ error: "Excel dosyası yüklenemedi" });
    }
}
