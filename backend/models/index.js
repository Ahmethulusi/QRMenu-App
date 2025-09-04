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

// Products - Category association'ları
Products.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(Products, {
  foreignKey: 'category_id',
  as: 'products'
});

// BranchProduct association'ları
BranchProduct.belongsTo(Products, {
  foreignKey: 'product_id',
  as: 'Product'
});

Products.hasMany(BranchProduct, {
  foreignKey: 'product_id',
  as: 'BranchProducts'
});

BranchProduct.belongsTo(Branch, {
  foreignKey: 'branch_id',
  targetKey: 'id', // Branch tablosundaki id kolonunu referans al
  as: 'Branch'
});

Branch.hasMany(BranchProduct, {
  foreignKey: 'branch_id',
  sourceKey: 'id', // Branch tablosundaki id kolonunu kullan
  as: 'BranchProducts'
});

// Section - Category association'ları
Section.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(Section, {
  foreignKey: 'category_id',
  as: 'sections'
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

// Products - RecommendedProduct associations
RecommendedProduct.belongsTo(Products, {
  foreignKey: 'product_id',
  as: 'MainProduct'
});

RecommendedProduct.belongsTo(Products, {
  foreignKey: 'recommended_product_id',
  as: 'RecommendedProduct'
});

Products.hasMany(RecommendedProduct, {
  foreignKey: 'product_id',
  as: 'RecommendedProducts'
});

Products.hasMany(RecommendedProduct, {
  foreignKey: 'recommended_product_id',
  as: 'RecommendedForProducts'
});

// Translation association'ları
ProductTranslation.belongsTo(Products, {
  foreignKey: 'product_id',
  as: 'product'
});

Products.hasMany(ProductTranslation, {
  foreignKey: 'product_id',
  as: 'translations'
});

ProductTranslation.belongsTo(Language, {
  foreignKey: 'language_code',
  targetKey: 'code',
  as: 'language'
});

Language.hasMany(ProductTranslation, {
  foreignKey: 'language_code',
  sourceKey: 'code',
  as: 'productTranslations'
});

CategoryTranslation.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(CategoryTranslation, {
  foreignKey: 'category_id',
  as: 'translations'
});

CategoryTranslation.belongsTo(Language, {
  foreignKey: 'language_code',
  targetKey: 'code',
  as: 'language'
});

Language.hasMany(CategoryTranslation, {
  foreignKey: 'language_code',
  sourceKey: 'code',
  as: 'categoryTranslations'
});

BusinessTranslation.belongsTo(Business, {
  foreignKey: 'business_id',
  as: 'business'
});

Business.hasMany(BusinessTranslation, {
  foreignKey: 'business_id',
  as: 'translations'
});

BusinessTranslation.belongsTo(Language, {
  foreignKey: 'language_code',
  targetKey: 'code',
  as: 'language'
});

Language.hasMany(BusinessTranslation, {
  foreignKey: 'language_code',
  sourceKey: 'code',
  as: 'businessTranslations'
});

// Language - Currency association'ları
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
  RecommendedProduct,
  Ingredient
};
