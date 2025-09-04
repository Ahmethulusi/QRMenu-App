const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const RecommendedProduct = sequelize.define('RecommendedProduct', {
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
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Ana ürün ID'
  },
  recommended_product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'product_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Yanında iyi gider ürün ID'
  },
  additional_price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    defaultValue: 0,
    comment: 'Yanında iyi gider ürün için ek fiyat'
  }
}, {
  tableName: 'recommended_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'recommended_product_id']
    }
  ]
});

// İlişkileri tanımlama
RecommendedProduct.associate = models => {
  RecommendedProduct.belongsTo(models.Products, { 
    foreignKey: 'product_id',
    as: 'MainProduct'
  });
  RecommendedProduct.belongsTo(models.Products, { 
    foreignKey: 'recommended_product_id',
    as: 'RecommendedProduct'
  });
};

module.exports = RecommendedProduct;
