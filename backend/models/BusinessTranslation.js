const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const BusinessTranslation = sequelize.define('BusinessTranslation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'business_id',
    },
  },
  language_code: {
    type: DataTypes.STRING(5),
    allowNull: false,
    references: {
      model: 'languages',
      key: 'code',
    },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'business_translations',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['business_id', 'language_code']
    }
  ]
});

BusinessTranslation.associate = models => {
  BusinessTranslation.belongsTo(models.Business, { 
    foreignKey: 'business_id',
    as: 'business'
  });
  BusinessTranslation.belongsTo(models.Language, { 
    foreignKey: 'language_code',
    targetKey: 'code',
    as: 'language'
  });
};

module.exports = BusinessTranslation;
