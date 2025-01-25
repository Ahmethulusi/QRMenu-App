
const Sequelize = require('sequelize');

const sequelize = new Sequelize('QRMenu', 'postgres', 'Promaster1234.', {
    host: 'localhost',
    dialect: 'postgres'
});

module.exports = sequelize;