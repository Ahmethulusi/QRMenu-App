const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Branch = sequelize.define('Branch', {
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

Branch.associate = models => {
  Branch.belongsTo(models.Business, { foreignKey: 'business_id',targetKey:"id"});
  Branch.hasMany(models.BranchProduct, { foreignKey: 'branch_id' }); // bu satır eksik olabilir
  Branch.hasMany(models.Section, { foreignKey: 'branch_id'});
  Branch.hasMany(models.QRCode, { foreignKey: 'branch_id'});
};

module.exports = Branch;
