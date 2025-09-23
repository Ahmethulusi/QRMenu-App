const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ProductTranslation = sequelize.define('ProductTranslation', {
  id: {
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
  },
  language_code: {
    type: DataTypes.STRING(5),
    allowNull: false,
    references: {
      model: 'languages',
      key: 'code',
    },
  },
  product_name: {
    type: DataTypes.STRING(100), // Çeviri için daha uzun
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  allergens: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'product_translations',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'language_code']
    }
  ]
});

module.exports = ProductTranslation;
