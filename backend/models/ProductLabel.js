const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ProductLabel = sequelize.define('ProductLabel', {
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'product_id'
    }
  },
  label_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'labels',
      key: 'label_id'
    }
  }
}, {
  tableName: 'product_labels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'label_id']
    }
  ]
});

module.exports = ProductLabel;
