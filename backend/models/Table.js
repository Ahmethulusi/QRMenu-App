const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Branch = require('./Branch');

const Table = sequelize.define('Table', {
  table_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  branch_id:{
    type:DataTypes.INTEGER,
    allowNull:true,
  },
  section_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'tables',
  timestamps: false,
});

Table.associate = models => {
  Table.belongsTo(models.Section, { foreignKey: 'section_id' ,targetKey:"id"});// Opsiyoneldir. Küçük bir işletmenin bölümlere ayrılmasına gerek yok masa bazlı takip yapılır.
  Table.belongsTo(models.Branch, { foreignKey: 'branch_id' ,targetKey:"id"});// Opsiyoneldir. Daha Bölümlere ayırmadan da masalara farklı qrlar verme işlemi yapılabilir.
};

module.exports = Table;
