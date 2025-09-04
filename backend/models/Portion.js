const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Portion = sequelize.define('Portion', {
  portion_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'product_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Porsiyon adı (küçük, orta, büyük gibi)'
  },
  quantity: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Miktar bilgisi (100 ml, 250 gr gibi)'
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    comment: 'Porsiyona özel fiyat (opsiyonel)'
  }
}, {
  tableName: 'portions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Portion;


