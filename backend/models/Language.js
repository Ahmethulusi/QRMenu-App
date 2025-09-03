const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Language = sequelize.define('Language', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(5), // tr, en, de, fr, ar
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(50), // Türkçe, English, Deutsch
    allowNull: false,
  },
  native_name: {
    type: DataTypes.STRING(50), // Türkçe, English, Deutsch
    allowNull: false,
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  direction: {
    type: DataTypes.ENUM('ltr', 'rtl'), // left-to-right, right-to-left
    defaultValue: 'ltr',
  },
  default_currency_code: {
    type: DataTypes.STRING(3), // USD, EUR, TRY, GBP
    allowNull: true,
    references: {
      model: 'currencies',
      key: 'code'
    }
  }
}, {
  tableName: 'languages',
  timestamps: false,
});

module.exports = Language;
