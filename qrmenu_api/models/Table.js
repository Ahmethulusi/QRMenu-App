const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Table = sequelize.define('Table', {
  table_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  branch_id:{
    type:DataTypes.INTEGER,
    allowNull:true,
  },
  section_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'tables',
  timestamps: false,
});

module.exports = Table;
