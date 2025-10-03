const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Category = sequelize.define('Category', {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_name: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  sira_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  parent_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  image_url:{
    type:DataTypes.STRING(200),
    allowNull: true,
  },
  category_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'ERP sistemindeki stok grup kodu'
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Kategori aktif mi?'
  },
  cloudurl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Cloud URL for category image'
  },
  cloudpath: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Cloud path for category image'
  }
}, {
  tableName: 'categories',
  timestamps: false,
});

module.exports = Category;
