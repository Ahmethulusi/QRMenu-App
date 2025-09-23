const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Branch = sequelize.define('Branch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adress:{
    type: DataTypes.STRING,
    allowNull:false,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'business_id',
    },
  },
}, {
  tableName: 'branches',
  timestamps: false,
});

module.exports = Branch;
