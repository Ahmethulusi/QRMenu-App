const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  currency_code: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'TRY',
    comment: 'Fiyatın para birimi (TRY, USD, EUR, vb.)'
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  business_id: {  
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    },
  },
  is_selected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sira_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  calorie_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cooking_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  carbs: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Karbonhidrat miktarı (gram)'
  },
  protein: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Protein miktarı (gram)'
  },
  fat: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Yağ miktarı (gram)'
  },
  allergens: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alerjen bilgileri'
  },
  product_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'ERP sistemindeki stok kodu'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Ürün aktif mi?'
  },
  cloudurl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Cloud URL for product image'
  },
  cloudpath: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Cloud path for product image'
  }
}, {
  tableName: 'products',
  timestamps: false,
});

module.exports = Product;
