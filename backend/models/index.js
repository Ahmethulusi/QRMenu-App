const sequelize = require('../db');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const User = require('./User');
const Business = require('./Business');
const Branch = require('./Branch');
const Category = require('./Category');
const Products = require('./Products');
const BranchProduct = require('./BranchProduct');
const Section = require('./Section');
const QRCode = require('./QRCode');
const Table = require('./Table');
const Label = require('./Label');
const ProductLabel = require('./ProductLabel');
const Announcement = require('./Announcement');
const Language = require('./Language');
const ProductTranslation = require('./ProductTranslation');
const CategoryTranslation = require('./CategoryTranslation');
const BusinessTranslation = require('./BusinessTranslation');
const Currency = require('./Currency');
const Portion = require('./Portion');
const Ingredient = require('./Ingredient');
const RecommendedProduct = require('./RecommendedProduct');

// Permission - RolePermission association'ları
RolePermission.belongsTo(Permission, {
  foreignKey: 'permission_id',
  as: 'permission'
});

Permission.hasMany(RolePermission, {
  foreignKey: 'permission_id',
  as: 'rolePermissions'
});

// User - Business association'ları
User.belongsTo(Business, {
  foreignKey: 'business_id',
  as: 'business'
});

Business.hasMany(User, {
  foreignKey: 'business_id',
  as: 'users'
});

// Branch - Business association'ları
Branch.belongsTo(Business, {
  foreignKey: 'business_id',
  as: 'business'
});

Business.hasMany(Branch, {
  foreignKey: 'business_id',
  as: 'branches'
});

// Products - Business association'ları
Products.belongsTo(Business, {
  foreignKey: 'business_id',
  as: 'business'
});

Business.hasMany(Products, {
  foreignKey: 'business_id',
  as: 'products'
});

// Products - Category association'ları
Products.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(Products, {
  foreignKey: 'category_id',
  as: 'products'
});

// BranchProduct - Branch association'ları
BranchProduct.belongsTo(Branch, {
  foreignKey: 'branch_id',
  targetKey: 'id' // Branch tablosundaki id kolonunu referans al
});

BranchProduct.belongsTo(Products, {
  foreignKey: 'product_id',
  targetKey: 'product_id', // Products tablosundaki product_id kolonunu referans al
  as: 'Product'
});

Branch.hasMany(BranchProduct, {
  foreignKey: 'branch_id',
  sourceKey: 'id', // Branch tablosundaki id kolonunu kullan
  as: 'BranchProducts'
});

// NOT: Section modelinde category_id alanı bulunmuyor, bu ilişki kaldırıldı
// Section - Category association'ları artık kullanılmıyor

// Branch - Section association'ları
Section.belongsTo(Branch, {
  foreignKey: 'branch_id',
  targetKey: 'id',
  as: 'Branch'
});

Branch.hasMany(Section, {
  foreignKey: 'branch_id',
  sourceKey: 'id',
  as: 'sections'
});

// Table - Section association'ları
Table.belongsTo(Section, {
  foreignKey: 'section_id',
  targetKey: 'id',
  as: 'Section'
});

Section.hasMany(Table, {
  foreignKey: 'section_id',
  sourceKey: 'id',
  as: 'tables'
});

// Table - Branch association'ları
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

// QRCode - Branch association'ları
QRCode.belongsTo(Branch, {
  foreignKey: 'branch_id',
  targetKey: 'id', // Branch tablosundaki id kolonunu referans al
  as: 'Branch'
});

Branch.hasMany(QRCode, {
  foreignKey: 'branch_id',
  sourceKey: 'id', // Branch tablosundaki id kolonunu kullan
  as: 'qrcodes'
});

// QRCode - Table association'ları
QRCode.belongsTo(Table, {
  foreignKey: 'table_id',
  as: 'Table'
});

Table.hasMany(QRCode, {
  foreignKey: 'table_id',
  as: 'qrcodes'
});

// Products - Labels Many-to-Many association
Products.belongsToMany(Label, {
  through: ProductLabel,
  foreignKey: 'product_id',
  otherKey: 'label_id',
  as: 'labels'
});

Label.belongsToMany(Products, {
  through: ProductLabel,
  foreignKey: 'label_id',
  otherKey: 'product_id',
  as: 'products'
});

// Products - Portions One-to-Many association
Portion.belongsTo(Products, {
  foreignKey: 'product_id',
  as: 'product'
});

Products.hasMany(Portion, {
  foreignKey: 'product_id',
  as: 'portions'
});

// Products - Ingredients One-to-Many association
Ingredient.belongsTo(Products, {
  foreignKey: 'product_id',
  as: 'product'
});

Products.hasMany(Ingredient, {
  foreignKey: 'product_id',
  as: 'ingredients'
});

// Products - RecommendedProduct Many-to-Many association
RecommendedProduct.belongsTo(Products, {
  foreignKey: 'product_id',
  as: 'product'
});

RecommendedProduct.belongsTo(Products, {
  foreignKey: 'recommended_product_id',
  as: 'recommendedProduct'
});

Products.hasMany(RecommendedProduct, {
  foreignKey: 'product_id',
  as: 'recommendedProducts'
});

// Category - CategoryTranslation One-to-Many association
CategoryTranslation.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(CategoryTranslation, {
  foreignKey: 'category_id',
  as: 'translations'
});

// Products - ProductTranslation One-to-Many association
ProductTranslation.belongsTo(Products, {
  foreignKey: 'product_id',
  as: 'product'
});

Products.hasMany(ProductTranslation, {
  foreignKey: 'product_id',
  as: 'translations'
});

// Business - BusinessTranslation One-to-Many association
BusinessTranslation.belongsTo(Business, {
  foreignKey: 'business_id',
  as: 'business'
});

Business.hasMany(BusinessTranslation, {
  foreignKey: 'business_id',
  as: 'translations'
});

// Language associations
CategoryTranslation.belongsTo(Language, {
  foreignKey: 'language_code',
  targetKey: 'code',
  as: 'language'
});

ProductTranslation.belongsTo(Language, {
  foreignKey: 'language_code',
  targetKey: 'code',
  as: 'language'
});

BusinessTranslation.belongsTo(Language, {
  foreignKey: 'language_code',
  targetKey: 'code',
  as: 'language'
});

Language.hasMany(CategoryTranslation, {
  foreignKey: 'language_code',
  sourceKey: 'code',
  as: 'categoryTranslations'
});

Language.hasMany(ProductTranslation, {
  foreignKey: 'language_code',
  sourceKey: 'code',
  as: 'productTranslations'
});

Language.hasMany(BusinessTranslation, {
  foreignKey: 'language_code',
  sourceKey: 'code',
  as: 'businessTranslations'
});

// Language - Currency association
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

// NOT: Business - Currency association kaldırıldı çünkü businesses tablosunda currency_code kolonu yok

// Modelleri dışa aktar
module.exports = {
  sequelize,
  Permission,
  RolePermission,
  User,
  Business,
  Branch,
  Category,
  Products,
  BranchProduct,
  Section,
  QRCode,
  Table,
  Label,
  ProductLabel,
  Announcement,
  Language,
  ProductTranslation,
  CategoryTranslation,
  BusinessTranslation,
  Currency,
  Portion,
  Ingredient,
  RecommendedProduct
};