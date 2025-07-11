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
    allowNull: false,
  },
  parent_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  image_url:{
    type:DataTypes.STRING(200),
    allowNull: true,
  }
}, {
  tableName: 'categories',
  timestamps: false,
});

Category.associate = models => {
  Category.hasMany(models.Product, { foreignKey: 'category_id' });
};

module.exports = Category;
