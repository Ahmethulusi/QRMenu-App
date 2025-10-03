const sequelize = require('../db');

// Model imports
const QRCode = require('./QRCode');
const Branch = require('./Branch');
const Table = require('./Table');
const Product = require('./Products');
const Category = require('./Category');
const Language = require('./Language');

// Ek modeller
const Portion = require('./Portion');
const Ingredient = require('./Ingredient');
const RecommendedProduct = require('./RecommendedProduct');

// Çeviri modelleri
const ProductTranslation = require('./ProductTranslation');
const CategoryTranslation = require('./CategoryTranslation');

// Etiket modelleri
const Label = require('./Label');
const ProductLabel = require('./ProductLabel');

// Para birimi modeli
const Currency = require('./Currency');

// Duyuru modeli
const Announcement = require('./Announcement');

// İşletme modeli
const Business = require('./Business');

// Bölüm modeli
const Section = require('./Section');

// Model relationships
// QRCode - Branch
QRCode.belongsTo(Branch, {
  foreignKey: 'branch_id',
  targetKey: 'id',
  as: 'Branch'
});

Branch.hasMany(QRCode, {
  foreignKey: 'branch_id',
  sourceKey: 'id',
  as: 'qrcodes'
});

// QRCode - Table
QRCode.belongsTo(Table, {
  foreignKey: 'table_id',
  as: 'Table'
});

Table.hasMany(QRCode, {
  foreignKey: 'table_id',
  as: 'qrcodes'
});

// Table - Branch
Table.belongsTo(Branch, {
  foreignKey: 'branch_id',
  targetKey: 'id',
  as: 'Branch'
});

Branch.hasMany(Table, {
  foreignKey: 'branch_id',
  sourceKey: 'id',
  as: 'tables'
});

// Product - Category
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});

// Product - Portions
Product.hasMany(Portion, {
  foreignKey: 'product_id',
  as: 'portions'
});

Portion.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// Product - Ingredients
Product.hasMany(Ingredient, {
  foreignKey: 'product_id',
  as: 'ingredients'
});

Ingredient.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// Product - RecommendedProduct
Product.hasMany(RecommendedProduct, {
  foreignKey: 'product_id',
  as: 'recommendedProducts'
});

RecommendedProduct.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

RecommendedProduct.belongsTo(Product, {
  foreignKey: 'recommended_product_id',
  as: 'recommendedProduct'
});

// Product - ProductTranslation
Product.hasMany(ProductTranslation, {
  foreignKey: 'product_id',
  as: 'translations'
});

ProductTranslation.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

ProductTranslation.belongsTo(Language, {
  foreignKey: 'language_code',
  targetKey: 'code',
  as: 'language'
});

// Category - CategoryTranslation
Category.hasMany(CategoryTranslation, {
  foreignKey: 'category_id',
  as: 'translations'
});

CategoryTranslation.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

CategoryTranslation.belongsTo(Language, {
  foreignKey: 'language_code',
  targetKey: 'code',
  as: 'language'
});

// Product - Label (Many-to-Many through ProductLabel)
Product.belongsToMany(Label, {
  through: ProductLabel,
  foreignKey: 'product_id',
  otherKey: 'label_id',
  as: 'labels'
});

Label.belongsToMany(Product, {
  through: ProductLabel,
  foreignKey: 'label_id',
  otherKey: 'product_id',
  as: 'products'
});

// ProductLabel associations
ProductLabel.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

ProductLabel.belongsTo(Label, {
  foreignKey: 'label_id',
  as: 'label'
});

// Language - Currency
Language.belongsTo(Currency, {
  foreignKey: 'default_currency_code',
  targetKey: 'code',
  as: 'defaultCurrency'
});

Currency.hasMany(Language, {
  foreignKey: 'default_currency_code',
  sourceKey: 'code',
  as: 'languages'
});

// Business - Announcement
Business.hasMany(Announcement, {
  foreignKey: 'business_id',
  sourceKey: 'business_id',
  as: 'announcements'
});

Announcement.belongsTo(Business, {
  foreignKey: 'business_id',
  targetKey: 'business_id',
  as: 'business'
});

// Business - Branch
Business.hasMany(Branch, {
  foreignKey: 'business_id',
  sourceKey: 'business_id',
  as: 'branches'
});

Branch.belongsTo(Business, {
  foreignKey: 'business_id',
  targetKey: 'business_id',
  as: 'business'
});

// Export models
module.exports = {
  sequelize,
  QRCode,
  Branch,
  Table,
  Product,
  Category,
  Language,
  Portion,
  Ingredient,
  RecommendedProduct,
  ProductTranslation,
  CategoryTranslation,
  Label,
  ProductLabel,
  Currency,
  Announcement,
  Business,
  Section
};
