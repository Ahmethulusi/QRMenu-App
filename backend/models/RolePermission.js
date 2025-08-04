const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'manager'),
    allowNull: false,
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'id',
    },
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // null = tüm işletmeler (süper admin için)
    references: {
      model: 'businesses',
      key: 'id',
    },
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // null = tüm şubeler
    references: {
      model: 'branches',
      key: 'id',
    },
  },
}, {
  tableName: 'role_permissions',
  timestamps: false,
});

module.exports = RolePermission; 