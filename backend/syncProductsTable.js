const sequelize = require('./db');
const Products = require('./models/Products');

async function syncProductsTable() {
  try {
    console.log('Ürünler tablosu senkronize ediliyor...');
    
    // Sadece ürünler tablosunu güncelle, diğer tabloları etkileme
    await Products.sync({ alter: true });
    
    console.log('✅ Ürünler tablosu başarıyla güncellendi!');

    
    process.exit(0);
  } catch (error) {
    console.error('❌ Senkronizasyon hatası:', error);
    process.exit(1);
  }
}

// Senkronizasyonu başlat
syncProductsTable();
