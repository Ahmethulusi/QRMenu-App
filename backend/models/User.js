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
      key: 'id',
    },
  },
  // ERP SQL Server bağlantı bilgileri
  erp_server: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ERP SQL Server sunucu adresi'
  },
  erp_database: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'ERP veritabanı adı'
  },
  erp_username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'ERP veritabanı kullanıcı adı'
  },
  erp_password: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'ERP veritabanı şifresi'
  },
  erp_port: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1433,
    comment: 'ERP SQL Server port numarası'
  },
  erp_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'ERP entegrasyonu aktif mi?'
  },
  last_sync_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Son senkronizasyon tarihi'
  }
}, {
  tableName: 'users',
  timestamps: false,
});

User.associate = models => {
  User.belongsTo(models.Business, { 
    foreignKey: 'business_id', 
    targetKey: 'id',
    as: 'business'
  });
};

module.exports = User;
