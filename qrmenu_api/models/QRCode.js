const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const QRCode = sequelize.define('QRCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  table_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Siparişsiz sistemde null
  },
  type: {
    type: DataTypes.ENUM('orderable', 'nonorderable'),
    allowNull: false,
  },
  qr_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  logo_path: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'qrcodes',
  timestamps: false,
});

module.exports = QRCode;
