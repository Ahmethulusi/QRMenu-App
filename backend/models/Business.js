const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Logo image path'
  },
  banner_images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of banner image paths for carousel'
  },
  custom_domain: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Custom domain for the QR menu'
  },
  website_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Business website URL'
  },
  instagram_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Instagram profile URL'
  },
  facebook_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Facebook page URL'
  },
  twitter_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Twitter/X profile URL'
  },
  linkedin_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'LinkedIn profile URL'
  },
  youtube_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'YouTube channel URL'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Business phone number'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Business email address'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Business address'
  },
  about_text: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'About us text/description'
  },
  slogan: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Business slogan'
  },
  opening_hours: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Opening hours for each day of the week'
  },
  welcome_background: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Welcome screen background image path'
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
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'businesses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Business.associate = models => {
  Business.hasMany(models.User, { foreignKey: 'business_id', sourceKey: 'id' });
  Business.hasMany(models.Branch, { foreignKey: 'business_id', sourceKey: 'id' });
  Business.hasMany(models.Product, { foreignKey: 'business_id', sourceKey: 'id' });
  Business.hasMany(models.Table, { foreignKey: 'business_id', sourceKey: 'id' });
  Business.hasMany(models.BusinessTranslation, { 
    foreignKey: 'business_id', 
    sourceKey: 'id',
    as: 'translations'
  });
};

module.exports = Business;
