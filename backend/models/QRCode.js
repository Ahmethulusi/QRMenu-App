const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // sequelize instance'ınızı buraya ekleyin
const Business = require('./Business');
const Table = require('./Tables');

const QRCode = sequelize.define('QRCode', {
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
      key: 'id',
    },
  },
  table_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tables',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('orderable', 'nonorderable'),
    allowNull: false,
  },
  qr_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  logo_path: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'qrcodes',
  timestamps: false,
});

// İlişkiler
Business.hasMany(QRCode, { foreignKey: 'business_id' });
QRCode.belongsTo(Business, { foreignKey: 'business_id' });

Table.hasMany(QRCode, { foreignKey: 'table_id' });
QRCode.belongsTo(Table, { foreignKey: 'table_id' });

// QRCode.associate = models => {
//   QRCode.belongsTo(models.Business, { foreignKey: 'business_id' });
//   QRCode.belongsTo(models.Table, { foreignKey: 'table_id' });
// };

module.exports = QRCode;
