# Görsel Sıkıştırma Sistemi

## Genel Bakış

Bu sistem, Cloudflare R2'ye yüklenen görselleri otomatik olarak optimize eder ve sıkıştırır. Hedef, görsellerin maksimum 500-600 KB boyutunda olmasını sağlamaktır.

## Özellikler

- ✅ Otomatik görsel sıkıştırma (JPEG, PNG, WebP)
- ✅ Akıllı boyutlandırma (Aspect ratio korunur)
- ✅ Kalite optimizasyonu
- ✅ Detaylı sıkıştırma istatistikleri
- ✅ SVG dosyalarını atlama (vektörel görseller)
- ✅ Çoklu dosya desteği
- ✅ Tüm görsel yükleme türleri için destek (ürün, logo, duyuru, vb.)

## Teknik Detaylar

### Kullanılan Teknolojiler

- **Sharp**: Yüksek performanslı görsel işleme kütüphanesi
- **MozJPEG**: Optimize edilmiş JPEG sıkıştırma
- **Progressive JPEG**: Daha iyi web performansı için

### Sıkıştırma Stratejisi

1. **Boyut Kontrolü**: Dosya 600 KB'dan küçükse sıkıştırma yapılmaz
2. **Boyutlandırma**: Görseller tip bazlı maksimum boyutlara göre küçültülür
3. **Kalite Optimizasyonu**: 
   - İlk deneme: JPEG 85%, PNG 90%, WebP 85%
   - Hedef boyuta ulaşmak için kalite adım adım düşürülür (minimum 60%)
4. **Format Korunur**: Yüklenen formatla aynı formatta kaydedilir

### Maksimum Görsel Boyutları

| Tip | Maksimum Genişlik | Maksimum Yükseklik |
|-----|-------------------|-------------------|
| Product | 1920px | 1920px |
| Logo | 512px | 512px |
| Business Logo | 512px | 512px |
| Announcement | 1920px | 1080px |
| Category | 800px | 800px |
| Avatar | 512px | 512px |
| Business Banner | 1920px | 1080px |
| Welcome Background | 1920px | 1080px |

## Kullanım

### Otomatik Sıkıştırma

Cloudflare middleware kullanıldığında sıkıştırma otomatik olarak aktiftir:

```javascript
const { uploadSingleToCloudflare } = require('./middleware/uploadMiddleware');

// Ürün resmi yükleme - Otomatik sıkıştırma aktif
router.post('/upload', 
  uploadSingleToCloudflare('product', 'image'),
  (req, res) => {
    // req.file.compressionStats ile sıkıştırma bilgilerine erişilebilir
    console.log('Sıkıştırma Oranı:', req.file.compressionStats?.compressionRatio);
    res.json({ 
      success: true, 
      url: req.file.cloudUrl,
      compression: req.file.compressionStats
    });
  }
);
```

### Manuel Sıkıştırma

Sadece sıkıştırma yapmak için (Cloudflare olmadan):

```javascript
const ImageCompressionService = require('./utils/imageCompression');

const compressionService = new ImageCompressionService();

// Tek görsel sıkıştırma
const result = await compressionService.compressImage(
  '/path/to/image.jpg',
  'product',
  'image/jpeg'
);

console.log('Orijinal:', result.originalSizeKB, 'KB');
console.log('Sıkıştırılmış:', result.finalSizeKB, 'KB');
console.log('Tasarruf:', result.compressionRatio, '%');

// Çoklu görsel sıkıştırma
const files = [
  { path: '/path/to/image1.jpg', mimetype: 'image/jpeg' },
  { path: '/path/to/image2.png', mimetype: 'image/png' }
];

const results = await compressionService.compressMultipleImages(files, 'product');
const stats = compressionService.formatStats(results);
console.log('Toplam Tasarruf:', stats.totalSavedMB, 'MB');
```

## Sıkıştırma İstatistikleri

Yüklenen her görsel için sıkıştırma istatistikleri döndürülür:

```javascript
{
  compressed: true,              // Sıkıştırma yapıldı mı?
  originalSizeKB: 2500,          // Orijinal boyut (KB)
  finalSizeKB: 450,              // Son boyut (KB)
  compressionRatio: 82,          // Sıkıştırma oranı (%)
  processingTime: 1250,          // İşlem süresi (ms)
  attempts: 1                    // Deneme sayısı
}
```

## Controller Örneği

### Ürün Resmi Yükleme

```javascript
// Tek ürün resmi
router.post('/products/:id/image', 
  uploadSingleToCloudflare('product', 'image'),
  async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      product.image_url = req.file.cloudUrl;
      await product.save();

      res.json({
        success: true,
        product,
        compression: {
          originalSize: req.file.compressionStats?.originalSizeKB + ' KB',
          finalSize: req.file.compressionStats?.finalSizeKB + ' KB',
          saved: req.file.compressionStats?.compressionRatio + '%'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Çoklu ürün resimleri
router.post('/products/:id/images', 
  uploadMultipleToCloudflare('product', 'images', 5),
  async (req, res) => {
    try {
      const images = req.files.map(file => ({
        url: file.cloudUrl,
        compression: file.compressionStats
      }));

      res.json({
        success: true,
        images
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

### İşletme Logo ve Banner

```javascript
// Logo ve banner birlikte yükleme
router.post('/business/media', 
  uploadFieldsToCloudflare('business_logo', [
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const logo = req.files.logo?.[0];
      const banner = req.files.banner?.[0];

      res.json({
        success: true,
        logo: {
          url: logo?.cloudUrl,
          compression: logo?.compressionStats
        },
        banner: {
          url: banner?.cloudUrl,
          compression: banner?.compressionStats
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

## Performans

- **Hız**: Ortalama 1-2 saniye (2MB görsel için)
- **Sıkıştırma Oranı**: Ortalama %70-85 boyut azalması
- **Kalite Kaybı**: Minimal (kullanıcı fark etmez)

## Örnekler

### Örnek 1: Büyük Ürün Resmi
- **Önce**: 2.5 MB (3840x2160px)
- **Sonra**: 450 KB (1920x1080px)
- **Sıkıştırma**: %82
- **Süre**: 1.2 saniye

### Örnek 2: Logo
- **Önce**: 800 KB (2048x2048px)
- **Sonra**: 120 KB (512x512px)
- **Sıkıştırma**: %85
- **Süre**: 0.5 saniye

### Örnek 3: Zaten Optimize Edilmiş Görsel
- **Önce**: 300 KB
- **Sonra**: 300 KB (sıkıştırma atlandı)
- **Sıkıştırma**: %0
- **Süre**: 0ms

## Yapılandırma

Sıkıştırma ayarlarını özelleştirmek için `backend/utils/imageCompression.js` dosyasını düzenleyin:

```javascript
this.config = {
  maxSizeKB: 600,              // Maksimum hedef boyut
  quality: {
    jpeg: 85,                  // JPEG kalitesi
    webp: 85,                  // WebP kalitesi
    png: 90                    // PNG kalitesi
  },
  maxDimensions: {
    product: { width: 1920, height: 1920 }
    // ... diğer tipler
  }
};
```

## Sorun Giderme

### Sıkıştırma Çalışmıyor
- Sharp paketinin yüklü olduğundan emin olun: `npm list sharp`
- Console loglarını kontrol edin
- Dosya tipinin desteklendiğinden emin olun (JPEG, PNG, WebP)

### Görsel Kalitesi Düşük
- `imageCompression.js` içindeki kalite değerlerini artırın
- `maxSizeKB` değerini yükseltin

### İşlem Çok Yavaş
- Maksimum boyut sınırlamalarını düşürün
- Kalite değerlerini düşürün
- Sharp'ın en son sürümünü kullanın

## Notlar

- ⚠️ SVG dosyaları sıkıştırılmaz (vektörel formatta kalırlar)
- ⚠️ Orijinal dosyalar sıkıştırmadan sonra silinir
- ⚠️ Sıkıştırma işlemi geri alınamaz
- ✅ Tüm hatalar loglanır ve gracefully handle edilir
- ✅ Sıkıştırma başarısız olursa bile upload devam eder

## Gelecek Geliştirmeler

- [ ] WebP'ye otomatik dönüştürme
- [ ] Thumbnail oluşturma
- [ ] Batch sıkıştırma API'si
- [ ] Sıkıştırma önizlemesi
- [ ] Özel sıkıştırma profilleri

## Lisans

Bu sistem, QR Menu projesi için geliştirilmiştir.

