const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Section = sequelize.define('Section', {
  section_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'sections',
  timestamps: false,
});

Section.associate = models => {
  Section.belongsTo(models.Branch, { foreignKey: 'branch_id' ,targetKey:"id"});
  Section.hasMany(models.Table, { foreignKey: 'section_id' });
};

module.exports = Section;
