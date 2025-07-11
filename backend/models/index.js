const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../db'); // db.js'deki Sequelize instance'ını kullanıyoruz

const db = {};
const basename = path.basename(__filename);

// models klasöründeki tüm dosyaları al
fs.readdirSync(__dirname)
  .filter(file =>
    file !== basename &&
    file.endsWith('.js')
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
  });

// ilişkileri kur
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
