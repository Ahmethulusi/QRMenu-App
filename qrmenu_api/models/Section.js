const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Section = sequelize.define('Section', {
  section_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  section_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    comment: 'İşletme ID - hangi işletmeye ait bölüm'
  },
}, {
  tableName: 'sections',
  timestamps: false,
});

module.exports = Section;
