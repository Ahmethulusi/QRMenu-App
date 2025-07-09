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
  Business.hasMany(models.Section, { foreignKey: 'business_id' });
  Business.hasMany(models.QRDesignSetting, { foreignKey: 'business_id' });
  Business.hasMany(models.QRCode, { foreignKey: 'business_id' });
};

module.exports = Business;
