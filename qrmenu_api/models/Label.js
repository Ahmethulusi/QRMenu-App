const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Label = sequelize.define('Label', {
  label_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(7), // #FF5733 gibi hex color
    allowNull: true,
    defaultValue: '#007bff'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    },
    comment: 'İşletme ID - hangi işletmeye ait etiket'
  }
}, {
  tableName: 'labels',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Label;
