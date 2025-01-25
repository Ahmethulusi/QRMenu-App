const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Menu = sequelize.define('Menus', {
    menu_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    description:{
        type:DataTypes.STRING(100),
        allowNull: false,
    },
    price:{
        type:DataTypes.DOUBLE,
        allowNull: false,
    },
    is_active:{
        type:DataTypes.BOOLEAN,
        allownull:false,
        defaultValue: true,
    },
    created_at:{
        type:DataTypes.DATE,
        allownull:false,
        defaultValue: DataTypes.NOW,
    },
    name:{
        type:DataTypes.STRING(30),
        allownull:false,
    },

    }, {
    tableName: 'menus',
    timestamps: false,
});

module.exports = Menu;

