const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  user_id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'manager'),
    allowNull: false,
    defaultValue: 'manager',
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'business_id',
    },
  }
}, {
  tableName: 'users',
  timestamps: false,
});

User.associate = models => {
  User.belongsTo(models.Business, { 
    foreignKey: 'business_id', 
    targetKey: 'business_id',
    as: 'business'
  });
};

module.exports = User;
