const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const CategoryTranslation = sequelize.define('CategoryTranslation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'category_id',
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
  category_name: {
    type: DataTypes.STRING(100), // Çeviri için daha uzun
    allowNull: false,
  }
}, {
  tableName: 'category_translations',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['category_id', 'language_code']
    }
  ]
});

module.exports = CategoryTranslation;
