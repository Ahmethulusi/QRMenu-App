const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('visual_only', 'visual_text', 'subscription_form', 'text_image_button', 'newsletter_form', 'countdown_timer', 'countdown_image'),
    allowNull: false
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delay: {
    type: DataTypes.INTEGER, // milliseconds
    allowNull: true
  },
  button_text: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  button_color: {
    type: DataTypes.STRING(7), // hex color code
    allowNull: true
  },
  button_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  background_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  countdown_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  subscription_form_fields: {
    type: DataTypes.JSON,
    allowNull: true
  },
  newsletter_form_fields: {
    type: DataTypes.JSON,
    allowNull: true
  },
  layout_config: {
    type: DataTypes.JSON,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'announcements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Announcement;
