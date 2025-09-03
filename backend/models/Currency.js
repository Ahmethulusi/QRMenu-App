const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Currency = sequelize.define('Currency', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100), // Turkish Lira, US Dollar, Euro
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(3), // TRY, USD, EUR, GBP
    allowNull: false,
    unique: true,
  },
  symbol: {
    type: DataTypes.STRING(10), // ₺, $, €, £
    allowNull: false,
  },
  rate_to_usd: {
    type: DataTypes.DECIMAL(15, 6), // USD'ye göre kur
    allowNull: false,
    defaultValue: 1.0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'currencies',
  timestamps: true,
});

module.exports = Currency;
