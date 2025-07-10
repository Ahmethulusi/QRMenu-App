const Products = require('../models/Products');
const Category = require('../models/Category');
const Menus = require('../models/Menus');
const Menu_Products = require('../models/Menu_Products');
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

        const products = await Products.findAll({
            include: {
                model: Category
            }
        });
        res.json(products);
    } catch (error) {
        console.log(error);
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

exports.getProductById = async (req, res) => {

    const id = req.params.id;

    try {
        const product = await Products.findOne({
            where: {
                product_id: req.params.id
            },
            include: {
                model: Category
            }
        });
        res.json(product);
    } catch (err) {
        console.log(err);
    }
}
exports.createProduct = async (req, res) => {
    // Gelen verileri kontrol et
    if (!req.body) {
        return res.status(400).json({ error: "Request body is empty" });
    }
    try {
        const { name, price, description, category_id, status, showcase } = req.body;

        // Zorunlu alanlar kontrolü (validation)
        if (!name || !price || !category_id) {
            return res.status(400).json({ error: "Zorunlu alanlar eksik: productName, price, category_id" });
        }

        const existingProduct = await Products.findOne({
          where:{
            product_name:name
          }
        })

        if(existingProduct){
          message.error("Bu ürün zaten mevcut");
          return res.status(400).json({error:"Bu ürün zaten mevcut"});
        }

        const imageUrl = req.file ? req.file.filename : null;
        // Ürün sırası için ürün sayısı alınıyor
        const count = await Products.count();

        
        // Yeni ürün oluşturuluyor
        const product = await Products.create({
            product_name: name,
            price: price,
            description: description,
            category_id: category_id,
            is_selected: showcase,
            is_available: status,
            sira_id: count + 1,  // Ürün sırası
            image_url: imageUrl,  // Yüklenen resim URL'si
        });

        // Başarılı yanıt
        return res.status(201).json(product);

    } catch (error) {
        console.error("Product creation error:", error);
        return res.status(500).json({ error: "Ürün oluşturulurken bir hata oluştu." });
    }
};

exports.updateProduct = async (req, res) => {
    const { newName, newPrice, newDescription, newCategory_id ,id} = req.body;
    try {
        const product = await Products.update({
            product_name: newName,
            price: newPrice,
            description: newDescription,
            category_id: newCategory_id,
            // image_url:imageUrl
        }, {
            where: {
                product_id: id
            }
        });
        res.json(product);
    } catch (error) {
        console.log(error);
    }   
}

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        console.log(error);
    }
}

exports.createCategory = async (req, res) => {
    try {
      const {category_name} = req.body;
      console.log('Gönderilen veri:', { category_name: category_name });

      const image_url = req.file ? req.file.filename : null;
      console.log(image_url);
      // Değerin null olup olmadığını kontrol et
      if (!category_name) {
        return res.status(400).json({ error: "Kategori adı boş olamaz!" });
      }
  
      const category = await Category.create({
        category_name: category_name,
        sira_id: 0,
        parent_id: null,
        image_url: image_url
      });
      
      res.json(category);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Bir hata oluştu!" });
    }
  };
  

exports.createSubCategory = async (req,res) =>{
    const {name,parentId} = req.body;
    try {
        const category = await Category.create({
            category_name:name,
            sira_id:0,
            parent_id:parentId
        });
        res.json(category);
    }
    catch (error) {
        console.log(error);
    }
}

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

  exports.createMenu = async (req, res) => {
    const { menuName, price, description} = req.body;
    try {
        const menu= await Menus.create({
            name: menuName,
            price: price,
            description: description,
        });
        res.json(menu);
    } catch (error) {
        console.log(error);
    }
}

exports.getMenus = async (req,res) =>{
    try{
        const menus = await Menus.findAll();
        res.json(menus);
    }catch(err){
        console.log(err);
    }
}

exports.getMenuById = async (req,res)=>{
    const id = req.params.id;
    try{
        const menu = await Menus.findOne({
            where:{
                menu_id:id,
            }
        });
        res.json(menu);
    }catch(err){
        console.log(err);
    }
}

exports.save_Products_To_Selected_Menu = async (req,res) => {
    const {menuId,products} = req.body;
    const productIds = products.map(product => product.product_id);
    const selectedMenuId = menuId;
    
    if (!selectedMenuId || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Geçersiz veri' });
    }
    try{
        for (let productId of productIds) {
            await Menu_Products.create({
                menu_id: selectedMenuId,
                product_id: productId,
            });
        }
        res.sendStatus(200);
    }catch(err){
        console.log(err);
    }
}

exports.getRegisteredProducts = async (req, res) => {
    const selectedMenuId = req.params.id;
    try {
      const menu_x = await Menus.findAll({
        where: {
          menu_id: selectedMenuId,
        },
        include: {
          model: Products,
          attributes: ['product_id', 'product_name'],
        },
      });;
      res.json(menu_x[0].dataValues.Products);
    } catch (err) {
      console.log(err);
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
  
// exports.uploadExcel = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'Lütfen bir Excel dosyası yükleyin.' });
//     }

//     const workbook = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const data = xlsx.utils.sheet_to_json(worksheet);

//     if (data.length === 0) {
//       return res.status(400).json({ message: 'Excel dosyası boş.' });
//     }

//     // Zorunlu alanları kontrol et
//     const missingFields = [];
//     data.forEach((item, index) => {
//       console.log(item);
//       if (!item.product_name) missingFields.push(`Satır ${index + 1}: Ürün adı eksik`);
//       if (!item.price) missingFields.push(`Satır ${index + 1}: Fiyat eksik`);
//       if (!item.category_id) missingFields.push(`Satır ${index + 1}: Kategori ID eksik`);
//     });

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         message: 'Zorunlu alanlar eksik:',
//         details: missingFields
//       });
//     }

//     const count = await Products.count();
//     const duplicateProducts = [];
//     const successfulProducts = [];

//     for (let i = 0; i < data.length; i++) {
//       const item = data[i];

//       const existingProduct = await Products.findOne({
//         where: {
//           product_name: item.product_name
//         }
//       });

//       if (existingProduct) {
//         duplicateProducts.push(item.product_name);
//         continue;
//       }

//       await Products.create({
//         product_name: item.product_name,
//         price: item.price,
//         category_id: item.category_id,
//         description: item.description || null,
//         is_selected: item.is_selected || false,
//         is_available: item.is_available === undefined ? true : item.is_available,
//         sira_id: count + 1,
//         image_url: item.image_url || null,
//         calorie_count: item.calorie_count || null,
//         cooking_time: item.cooking_time || null,
//         stock: item.stock || null
//       });
      
//       successfulProducts.push(item.product_name); // Bu satırı döngü içine taşıdık
//     }

//     res.status(200).json({ 
//       message: 'Excel dosyası başarıyla yüklendi ve veritabanına eklendi.',
//       addedProducts: successfulProducts,
//       duplicateProducts: duplicateProducts,
//       addedCount: successfulProducts.length,
//       duplicateCount: duplicateProducts.length
//     });
//   } catch (error) {
//     console.error('Excel dosyası yüklenirken bir hata oluştu:', error);
//     res.status(500).json({ 
//       message: 'Excel dosyası yüklenirken bir hata oluştu.',
//       error: error.message 
//     });
//   }
// }




// const xlsx = require('xlsx');
// const { Products, Category } = require('../models');
// const sequelize = require('sequelize');
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

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      const existingProduct = await Products.findOne({
        where: { product_name: item.product_name }
      });
      if (existingProduct) {
        duplicateProducts.push(item.product_name);
        continue;
      }

      const categoryName = item.category_name.toString().trim().toLowerCase();
      let matchedCategory = allCategories.find(cat =>
        cat.category_name.toString().trim().toLowerCase() === categoryName
      );

      // ✅ Yakın eşleşme yapılmazsa yeni oluşturulacak
      if (!matchedCategory) {
        const { bestMatch } = stringSimilarity.findBestMatch(categoryName, allCategoryNames);
        const bestMatchName = bestMatch.target;
        const bestCategory = allCategories.find(cat =>
          cat.category_name.toString().trim().toLowerCase() === bestMatchName
        );

        if (bestMatch.rating > 0.6 && bestCategory) {
          matchedCategory = bestCategory;
        } else {
          try {
            matchedCategory = await Category.create({
              category_name: item.category_name.trim(),
              parent_id: null,
              sira_id: 0,
              depth: 0
            });
            allCategories.push(matchedCategory); // Belleğe yeni kategori de eklenmeli
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
          stock: item.stock || null
        });

        successfulProducts.push(item.product_name);
      } catch (createErr) {
        categoryErrors.push(`Satır ${i + 1}: ${item.product_name} ürünü eklenemedi.`);
      }
    }

    res.status(200).json({
      message: 'Excel yüklemesi tamamlandı.',
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
