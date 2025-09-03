const { Products, Currency } = require('../models');

const fixPricesToOriginalTRY = async () => {
  try {
    console.log('🔄 Fiyatlar orijinal TRY değerlerine döndürülüyor...');
    
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
      // Mevcut fiyat TRY kuru ile çarpılmış durumda, orijinal TRY değerine döndür
      const currentPrice = product.price;
      const originalTRYPrice = currentPrice / tryCurrency.rate_to_usd;
      
      // Küsüratı at ve tam sayı yap
      const roundedPrice = Math.round(originalTRYPrice);
      
      // Fiyatı güncelle
      await product.update({ price: roundedPrice });
      updatedCount++;
      
      console.log(`✅ ${product.product_name}: ₺${currentPrice} → ₺${roundedPrice} (orijinal TRY değeri)`);
    }
    
    console.log(`🎉 ${updatedCount} ürün fiyatı orijinal TRY değerlerine döndürüldü!`);
    console.log(`📈 Düzeltme: Mevcut fiyat ÷ ${tryCurrency.rate_to_usd} = Orijinal TRY fiyatı`);
    
  } catch (error) {
    console.error('❌ Fiyat düzeltme hatası:', error);
  }
};

// Eğer bu dosya doğrudan çalıştırılıyorsa
if (require.main === module) {
  fixPricesToOriginalTRY().then(() => {
    console.log('✅ Fiyat düzeltme tamamlandı');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Fiyat düzeltme başarısız:', error);
    process.exit(1);
  });
}

module.exports = { fixPricesToOriginalTRY };
