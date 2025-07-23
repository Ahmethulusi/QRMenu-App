

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false, // istersen true yap debug için
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Cloud servisler için Render dahil şart
    },
  },
});

module.exports = sequelize;

