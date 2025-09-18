const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Business = sequelize.define('Business', {
  business_id: {
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
  Business.hasMany(models.User, { foreignKey: 'business_id', sourceKey: 'business_id' });
  Business.hasMany(models.Branch, { foreignKey: 'business_id', sourceKey: 'business_id' });
  Business.hasMany(models.Product, { foreignKey: 'business_id', sourceKey: 'business_id' });
  Business.hasMany(models.BusinessTranslation, { 
    foreignKey: 'business_id', 
    sourceKey: 'business_id',
    as: 'translations'
  });
};

module.exports = Business;
