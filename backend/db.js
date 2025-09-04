

const { Sequelize } = require('sequelize');
const path = require('path');

// Try loading .env from project root first; if not found, try backend/.env
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

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

