const { DataTypes } = require('sequelize');
const sequelize = require('../db');

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
}, {
  tableName: 'products',
  timestamps: false,
});

Product.associate = models => {
  Product.belongsTo(models.Category, { foreignKey: 'category_id' });
  Product.belongsTo(models.Business, { foreignKey: 'business_id' ,targetKey:'id'});
  Product.belongsToMany(models.Branch, {
    through: models.BranchProduct,
    foreignKey: 'product_id',
    otherKey: 'branch_id',
  });
};

module.exports = Product;
