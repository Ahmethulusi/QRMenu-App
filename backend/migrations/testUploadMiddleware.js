const { 
  uploadSingle, 
  uploadMultiple, 
  uploadFields, 
  uploadExcel,
  listUploadTypes,
  formatFileSize,
  customizeErrorMessages
} = require('../middleware/uploadMiddleware');

console.log('🚀 Upload Middleware Test Başlıyor...\n');

// 1. Mevcut upload tiplerini listele
console.log('📋 Mevcut Upload Tipleri:');
const types = listUploadTypes();
types.forEach(type => {
  console.log(`  • ${type.type}: ${type.destination} (${type.maxSize})`);
  console.log(`    Desteklenen türler: ${type.allowedTypes.join(', ')}`);
});
console.log('');

// 2. Dosya boyutu formatı testi
console.log('📏 Dosya Boyutu Format Testi:');
console.log(`  1024 bytes = ${formatFileSize(1024)}`);
console.log(`  1048576 bytes = ${formatFileSize(1048576)}`);
console.log(`  5242880 bytes = ${formatFileSize(5242880)}`);
console.log('');

// 3. Hata mesajlarını özelleştirme testi
console.log('🔧 Hata Mesajı Özelleştirme Testi:');
customizeErrorMessages('product', {
  errorMessage: 'Ürün resmi için özel hata mesajı!'
});
console.log('✅ Ürün tipi için hata mesajı özelleştirildi');
console.log('');

// 4. Middleware oluşturma testi
console.log('🔨 Middleware Oluşturma Testi:');
try {
  const productUpload = uploadSingle('product', 'resim');
  console.log('✅ Ürün upload middleware oluşturuldu');
  
  const announcementUpload = uploadFields('announcement', [
    { name: 'image', maxCount: 1 },
    { name: 'background_image', maxCount: 1 }
  ]);
  console.log('✅ Duyuru upload middleware oluşturuldu');
  
  const excelUpload = uploadExcel();
  console.log('✅ Excel upload middleware oluşturuldu');
  
} catch (error) {
  console.error('❌ Middleware oluşturma hatası:', error.message);
}

console.log('\n🎉 Test tamamlandı!');
console.log('\n📚 Kullanım Örnekleri:');
console.log('  • Tek resim: uploadSingle("product", "resim")');
console.log('  • Çoklu resim: uploadMultiple("product", "resimler", 5)');
console.log('  • Farklı alanlar: uploadFields("announcement", [{name: "image", maxCount: 1}])');
console.log('  • Excel: uploadExcel()');
console.log('  • Özel: createUploadMiddleware("product", {maxSize: 10*1024*1024})');
