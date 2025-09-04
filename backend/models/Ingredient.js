const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Ingredient = sequelize.define('Ingredient', {
  ingredient_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'product_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Malzeme adı'
  },
  type: {
    type: DataTypes.ENUM('ekstra', 'çıkarılacak'),
    allowNull: false,
    comment: 'Malzeme tipi: ekstra (ürüne eklenebilir) veya çıkarılacak (üründen çıkarılabilir)'
  }
}, {
  tableName: 'ingredients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Ingredient;
