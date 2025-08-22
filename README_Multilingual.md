# 🌍 Çok Dilli Sistem (Multilingual System)

Bu proje, QR Menü uygulaması için özel olarak tasarlanmış çok dilli bir sistem içerir. Sistem, ürün isimleri, kategori isimleri ve işletme bilgileri gibi özel içeriklerin çevirilerini yönetmek için tasarlanmıştır.

## 🎯 Özellikler

- **Özel Çeviri Sistemi**: Kütüphane çevirileri yerine manuel çeviri
- **Çoklu Dil Desteği**: Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, Arapça
- **RTL Desteği**: Arapça gibi sağdan sola yazılan diller için
- **Esnek Yapı**: Her işletme kendi çevirilerini yönetebilir
- **Performanslı**: JOIN ile tek sorguda çeviriler getirilir

## 🏗️ Sistem Mimarisi

### Veritabanı Modelleri

1. **Language**: Desteklenen diller
2. **ProductTranslation**: Ürün çevirileri
3. **CategoryTranslation**: Kategori çevirileri
4. **BusinessTranslation**: İşletme çevirileri

### API Endpoints

#### Dil Yönetimi
- `GET /api/languages/all` - Tüm aktif dilleri getir
- `GET /api/languages/default` - Varsayılan dili getir
- `POST /api/languages/add` - Yeni dil ekle (Admin)
- `PUT /api/languages/update/:id` - Dil güncelle (Admin)
- `PUT /api/languages/set-default/:id` - Varsayılan dili değiştir (Admin)
- `DELETE /api/languages/delete/:id` - Dil sil (Admin)

#### Çeviri Yönetimi
- `GET /api/translations/products` - Ürün çevirilerini getir
- `POST/PUT /api/translations/products` - Ürün çevirisi ekle/güncelle (Admin)
- `GET /api/translations/categories` - Kategori çevirilerini getir
- `POST/PUT /api/translations/categories` - Kategori çevirisi ekle/güncelle (Admin)
- `GET /api/translations/businesses` - İşletme çevirilerini getir
- `POST/PUT /api/translations/businesses` - İşletme çevirisi ekle/güncelle (Admin)
- `DELETE /api/translations/:type/:id` - Çeviri sil (Admin)

## 🚀 Kurulum

### 1. Backend Kurulumu

```bash
cd backend
npm install
```

### 2. Veritabanı Senkronizasyonu

```bash
npm run start
```

### 3. Varsayılan Dilleri Ekle

```bash
npm run seed:languages
```

### 4. Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

## 📱 Kullanım

### Dil Seçimi

Header'da dil seçici bulunur. Kullanıcı dil değiştirdiğinde:

1. Seçilen dil localStorage'a kaydedilir
2. Tüm API çağrıları seçilen dil ile yapılır
3. Ürün ve kategori isimleri seçilen dilde görüntülenir

### Çeviri Ekleme

#### Ürün Çevirisi

```javascript
// Yeni çeviri ekle
const response = await apiPost('/api/translations/products', {
  product_id: 1,
  language_code: 'en',
  product_name: 'Chicken Kebab',
  description: 'Delicious grilled chicken kebab',
  allergens: 'Contains gluten',
  recommended_with: 'Rice, salad'
});
```

#### Kategori Çevirisi

```javascript
// Kategori çevirisi ekle
const response = await apiPost('/api/translations/categories', {
  category_id: 1,
  language_code: 'en',
  category_name: 'Main Dishes'
});
```

### API Çağrılarında Dil Kullanımı

```javascript
// Dil kodu ile ürünleri getir
const products = await apiGet('/api/admin/products', 'en');

// Dil kodu ile kategorileri getir
const categories = await apiGet('/api/admin/categories', 'en');
```

## 🔧 Yapılandırma

### Yeni Dil Ekleme

1. Admin panelinden `/api/languages/add` endpoint'ini kullan
2. Dil kodu, adı ve yönünü belirt
3. Gerekirse varsayılan dil olarak ayarla

### Çeviri Alanları

#### Ürün Çevirileri
- `product_name`: Ürün adı
- `description`: Açıklama
- `allergens`: Alerjen bilgileri
- `recommended_with`: Önerilen yan ürünler

#### Kategori Çevirileri
- `category_name`: Kategori adı

#### İşletme Çevirileri
- `name`: İşletme adı
- `description`: İşletme açıklaması

## 🌐 Desteklenen Diller

| Kod | Dil | Yerel Ad | Yön |
|-----|-----|----------|-----|
| `tr` | Türkçe | Türkçe | LTR |
| `en` | İngilizce | English | LTR |
| `de` | Almanca | Deutsch | LTR |
| `fr` | Fransızca | Français | LTR |
| `es` | İspanyolca | Español | LTR |
| `ar` | Arapça | العربية | RTL |

## 🔒 Güvenlik

- Dil yönetimi sadece admin kullanıcılar tarafından yapılabilir
- Çeviri ekleme/güncelleme için `manage_translations` yetkisi gerekir
- Dil ekleme/güncelleme için `manage_languages` yetkisi gerekir

## 📊 Performans

- Çeviriler JOIN ile tek sorguda getirilir
- Veritabanında indeksler kullanılır
- Çeviri yoksa orijinal metin gösterilir
- Lazy loading ile çeviriler yüklenir

## 🐛 Sorun Giderme

### Çeviri Görünmüyor
1. Dil aktif mi kontrol et
2. Çeviri veritabanında mevcut mu kontrol et
3. API çağrısında dil kodu gönderiliyor mu kontrol et

### Dil Değişmiyor
1. localStorage'da dil kaydediliyor mu kontrol et
2. Context'te dil güncelleniyor mu kontrol et
3. API çağrıları yeni dil ile yapılıyor mu kontrol et

### Veritabanı Hatası
1. Modeller doğru import edilmiş mi kontrol et
2. İlişkiler doğru kurulmuş mu kontrol et
3. Veritabanı senkronize edilmiş mi kontrol et

## 🔮 Gelecek Özellikler

- [ ] Toplu çeviri import/export
- [ ] Çeviri kalite kontrolü
- [ ] Otomatik çeviri önerileri
- [ ] Çeviri geçmişi
- [ ] Çeviri istatistikleri
- [ ] Çoklu dil arama

## 📝 Notlar

- Sistem, özellikle restoran/menü uygulamaları için tasarlanmıştır
- Ürün isimleri genellikle özel olduğu için manuel çeviri tercih edilmiştir
- RTL diller için özel CSS desteği mevcuttur
- Dil değişiklikleri anında tüm component'lerde etkili olur

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
