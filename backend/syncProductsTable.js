const sequelize = require('./db');
const Products = require('./models/Products');

async function syncProductsTable() {
  try {
    console.log('Ürünler tablosu senkronize ediliyor...');
    
    // Sadece ürünler tablosunu güncelle, diğer tabloları etkileme
    await Products.sync({ alter: true });
    
    console.log('✅ Ürünler tablosu başarıyla güncellendi!');
    console.log('Eklenen yeni alanlar:');
    console.log('- carbs (Karbonhidrat miktarı)');
    console.log('- protein (Protein miktarı)');
    console.log('- fat (Yağ miktarı)');
    console.log('- allergens (Alerjenler)');
    console.log('- recommended_with (Yanında iyi gider önerileri)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Senkronizasyon hatası:', error);
    process.exit(1);
  }
}

// Senkronizasyonu başlat
syncProductsTable();
