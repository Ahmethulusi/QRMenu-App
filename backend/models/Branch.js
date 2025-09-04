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

Branch.associate = models => {
  Branch.belongsTo(models.Business, { foreignKey: 'business_id', targetKey: 'business_id'});
  Branch.hasMany(models.BranchProduct, { 
    foreignKey: 'branch_id',
    sourceKey: 'id', // Branch tablosundaki id kolonunu kullan
    as: 'BranchProducts'
  }); 
  Branch.hasMany(models.Section, { 
    foreignKey: 'branch_id',
    sourceKey: 'id'
  });
  Branch.hasMany(models.QRCode, { 
    foreignKey: 'branch_id',
    sourceKey: 'id'
  });
};

module.exports = Branch;
