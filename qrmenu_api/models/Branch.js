const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Branch = sequelize.define('Branch', {
  branch_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'  // Veritabanında 'id' olarak saklanır
  },
  id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.branch_id;
    }
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
      key: 'id',
    },
  },
}, {
  tableName: 'branches',
  timestamps: false,
});

module.exports = Branch;
