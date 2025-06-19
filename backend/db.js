// const Sequelize = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//         host: process.env.DB_HOST,
//         dialect: process.env.DB_DIALECT,
//         logging: process.env.DB_LOGGING === 'true',
//     }
// );

// module.exports = sequelize;


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

