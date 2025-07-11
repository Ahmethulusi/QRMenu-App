const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Business = sequelize.define('Business', {

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'businesses',
  timestamps: false,
});

Business.associate = models => {
  Business.hasMany(models.User, { foreignKey: 'business_id' });
  Business.hasMany(models.Branch, { foreignKey: 'business_id' });
  Business.hasMany(models.Product, { foreignKey: 'business_id' });
};

module.exports = Business;
