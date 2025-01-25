
const { DataTypes } = require('sequelize');

const sequelize = require('../db'); // sequelize instance'ınızı buraya ekleyin

const Menu_Products = sequelize.define('menu_products', {
    menu_id: {
        type: DataTypes.INTEGER,       
        allowNull: false,
        references: {
            model: 'menus',
            key: 'menu_id',
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'product_id',
        }
    },
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
}, {
    table_name : 'menu_products',
    timestamps: false,
}); 



module.exports = Menu_Products;
