const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resource: {
    type: DataTypes.STRING, // 'products', 'categories', 'users', etc.
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING, // 'create', 'read', 'update', 'delete'
    allowNull: false,
  },
}, {
  tableName: 'permissions',
  timestamps: false,
});

module.exports = Permission; 