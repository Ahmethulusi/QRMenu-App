// const { DataTypes } = require('sequelize');
// const sequelize = require('../db');

// const QRDesignSetting = sequelize.define('QRDesignSetting', {
//   business_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   type: {
//     type: DataTypes.ENUM('orderable', 'nonorderable'),
//     allowNull: false,
//   },
//   logo_path: {
//     type: DataTypes.TEXT,
//   },
//   color: {
//     type: DataTypes.STRING,
//   },
//   size: {
//     type: DataTypes.INTEGER,
//   },
// }, {
//   tableName: 'qr_design_settings',
//   timestamps: false,
// });

// QRDesignSetting.associate = models => {
//   QRDesignSetting.belongsTo(models.Business, { foreignKey: 'business_id' });
// };

// module.exports = QRDesignSetting;
