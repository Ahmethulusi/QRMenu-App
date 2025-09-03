
const { Products, Currency } = require('../models');

const migratePricesToTRY = async () => {
  try {
    console.log('🔄 Fiyatlar USD\'den TRY\'ye dönüştürülüyor...');
    
    // TRY para birimini bul
    const tryCurrency = await Currency.findOne({ where: { code: 'TRY' } });
    if (!tryCurrency) {
      console.error('❌ TRY para birimi bulunamadı!');
      return;
    }
    
    console.log(`📊 TRY kuru: ${tryCurrency.rate_to_usd}`);
    
    // Tüm ürünleri getir
    const products = await Products.findAll();
    console.log(`📦 ${products.length} ürün bulundu`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      // Mevcut fiyat USD olarak kabul ediliyor, TRY'ye dönüştür
      const usdPrice = product.price;
      const tryPrice = usdPrice * tryCurrency.rate_to_usd;
      
      // Fiyatı güncelle
      await product.update({ price: tryPrice });
      updatedCount++;
      
      console.log(`✅ ${product.product_name}: $${usdPrice} → ₺${Math.round(tryPrice)}`);
    }
    
    console.log(`🎉 ${updatedCount} ürün fiyatı başarıyla TRY'ye dönüştürüldü!`);
    console.log(`📈 Dönüşüm oranı: 1 USD = ${tryCurrency.rate_to_usd} TRY`);
    
  } catch (error) {
    console.error('❌ Fiyat dönüştürme hatası:', error);
  }
};

// Eğer bu dosya doğrudan çalıştırılıyorsa
if (require.main === module) {
  migratePricesToTRY().then(() => {
    console.log('✅ Migration tamamlandı');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Migration başarısız:', error);
    process.exit(1);
  });
}

module.exports = { migratePricesToTRY };
