const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const BranchProduct = sequelize.define('BranchProduct', {
  branch_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'branch_products',
  timestamps: false,
});

BranchProduct.associate = models => {
  BranchProduct.belongsTo(models.Branch, { foreignKey: 'branch_id' });
  BranchProduct.belongsTo(models.Product, { foreignKey: 'product_id' });
};

module.exports = BranchProduct;
