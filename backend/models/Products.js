//// IMPORTS
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // sequelize instance'ınızı buraya ekleyin
const Category  = require('./Category');
const Menus = require('./Menus');

// DEFİNİNG
const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_name: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'category_id',
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
  image_url:{
    type:DataTypes.STRING(200),
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
  }
}, {
  tableName: 'products',
  timestamps: false,
});


///// RELATIONSHIPS
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

Menus.belongsToMany(Product, { through: 'menu_products', foreignKey: 'menu_id',timestamps: false });
Product.belongsToMany(Menus, { through: 'menu_products', foreignKey: 'product_id' ,timestamps: false });



module.exports = Product;
