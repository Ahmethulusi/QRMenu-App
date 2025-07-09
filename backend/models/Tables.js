const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Table = sequelize.define('Table', {
  table_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'tables',
  timestamps: false,
});

Table.associate = models => {
  Table.belongsTo(models.Section, { foreignKey: 'section_id' });
  Table.hasMany(models.QRCode, { foreignKey: 'table_id' });
};

module.exports = Table;
