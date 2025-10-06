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
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id',
    }
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

ProductTranslation.associate = models => {
  ProductTranslation.belongsTo(models.Product, { 
    foreignKey: 'product_id',
    targetKey: 'product_id',
    as: 'product'
  });
  ProductTranslation.belongsTo(models.Language, { 
    foreignKey: 'language_code',
    targetKey: 'code',
    as: 'language'
  });
  ProductTranslation.belongsTo(models.Business, { 
    foreignKey: 'business_id',
    targetKey: 'id',
    as: 'business'
  });
};

module.exports = ProductTranslation;
