# 🚀 ERP Entegrasyon Modülü

Bu modül, müşterilerin ERP yazılımlarından (SQL Server) stok ve stok grup bilgilerini çekerek PostgreSQL veritabanına senkronize eder.

## 📋 Özellikler

- **SQL Server Bağlantısı**: mssql paketi ile güvenli bağlantı
- **Otomatik Senkronizasyon**: Kategoriler ve ürünler otomatik olarak güncellenir
- **QR Filtreleme**: Sadece `QRYAYINLANIR = 1` olan kayıtlar entegre edilir
- **Hiyerarşik Kategoriler**: Üst-alt kategori ilişkileri korunur
- **Fiyat Güncelleme**: ERP'den güncel fiyat bilgileri alınır

## 🗄️ Veritabanı Yapısı

### **STOK_GRUP Tablosu (Kategoriler)**
- `ID` → Kategori ID'si (primary key)
- `AD` → Kategori adı
- `USTID` → Üst kategori ID'si (parent)
- `QR_MENU_SIRA` → QR menü sıra numarası
- `AKTIF` → Aktif durumu
- `QRYAYINLANIR` → QR'da yayınlanacak mı?

### **STOK Tablosu (Ürünler)**
- `ID` → Ürün ID'si (primary key)
- `KOD` → Ürün kodu
- `AD` → Ürün adı
- `STOK_GRUP` → Kategori ID'si (foreign key)
- `SON_ALIS_FIYAT` → Fiyat
- `KALORI` → Kalori bilgisi
- `PISIRME_SURESI` → Pişirme süresi
- `SIRA` → Sıra numarası
- `AKTIF` → Aktif durumu
- `QRYAYINLANIR` → QR'da yayınlanacak mı?

## 🔧 Kurulum

### **1. Gerekli Paketler**
```bash
npm install mssql
```

### **2. Veritabanı Güncellemesi**
```bash
node updateERPIntegration.js
```

### **3. Model Güncellemeleri**
- `User.js`: ERP bağlantı bilgileri eklendi
- `Category.js`: ERP entegrasyon alanları eklendi
- `Products.js`: ERP entegrasyon alanları eklendi

## 📡 API Endpoints

### **ERP Konfigürasyonu**
- `PUT /api/erp/config` - ERP bağlantı bilgilerini güncelle
- `GET /api/erp/status` - ERP durumunu kontrol et

### **Senkronizasyon**
- `POST /api/erp/sync-categories` - Kategorileri senkronize et
- `POST /api/erp/sync-products` - Ürünleri senkronize et
- `POST /api/erp/full-sync` - Tam senkronizasyon
- `POST /api/erp/update-stock` - Fiyat bilgilerini güncelle

## 🚀 Kullanım

### **1. ERP Konfigürasyonu**
```javascript
const erpConfig = {
  erp_server: '192.168.1.100',
  erp_database: 'BabirDB',
  erp_username: 'erp_user',
  erp_password: 'password123',
  erp_port: 1433,
  erp_enabled: true
};

await User.update(erpConfig, { where: { id: userId } });
```

### **2. Senkronizasyon**
```javascript
const ERPIntegration = require('./utils/erpIntegration');
const userConfig = await getUserERPConfig(userId);

const erpIntegration = new ERPIntegration(userConfig.data);
const result = await erpIntegration.fullSync();

if (result.success) {
  console.log(`✅ ${result.data.categories.length} kategori, ${result.data.products.length} ürün senkronize edildi`);
}
```

## 🔍 Test Modülü

ERP Test modülü ile bağlantıyı test edebilirsiniz:
- **Bağlantı Testi**: SQL Server'a bağlanabildiğinizi doğrulayın
- **Otomatik Testler**: Tablo yapısını ve örnek verileri kontrol edin
- **Özel Sorgular**: Kendi SQL sorgularınızı test edin

## 📊 Senkronizasyon Mantığı

### **Kategori Senkronizasyonu**
1. `STOK_GRUP` tablosundan `QRYAYINLANIR = 1` olan kayıtları çek
2. Üst kategori ilişkilerini (`USTID`) kontrol et
3. PostgreSQL'de kategoriyi oluştur/güncelle
4. `category_code` olarak ERP'deki `ID` kullan

### **Ürün Senkronizasyonu**
1. `STOK` tablosundan `QRYAYINLANIR = 1` olan kayıtları çek
2. Kategori ID'sini (`STOK_GRUP`) kontrol et
3. PostgreSQL'de ürünü oluştur/güncelle
4. `product_code` olarak ERP'deki `KOD` kullan

### **Fiyat Güncelleme**
1. `STOK` tablosundan güncel fiyat bilgilerini çek
2. Sadece `QRYAYINLANIR = 1` olan ürünleri güncelle
3. `SON_ALIS_FIYAT` alanını kullan

## ⚠️ Önemli Notlar

- **Güvenlik**: ERP şifreleri şifrelenmiş olarak saklanmalı
- **Performans**: Büyük veri setleri için batch processing kullanın
- **Hata Yönetimi**: Bağlantı hatalarında retry mekanizması ekleyin
- **Logging**: Tüm senkronizasyon işlemlerini loglayın

## 🐛 Hata Giderme

### **Yaygın Hatalar**
1. **Bağlantı Hatası**: Firewall, port ve kimlik bilgilerini kontrol edin
2. **Tablo Bulunamadı**: Tablo adlarının doğru olduğundan emin olun
3. **Kolon Bulunamadı**: Kolon adlarının doğru olduğundan emin olun
4. **Yetki Hatası**: SQL Server kullanıcısının gerekli yetkilere sahip olduğundan emin olun

### **Test Sorguları**
```sql
-- Kategorileri test et
SELECT ID, AD, USTID, QR_MENU_SIRA FROM STOK_GRUP WHERE AKTIF = 1 AND QRYAYINLANIR = 1

-- Ürünleri test et
SELECT ID, KOD, AD, STOK_GRUP, SON_ALIS_FIYAT FROM STOK WHERE AKTIF = 1 AND QRYAYINLANIR = 1

-- QR yayın istatistikleri
SELECT COUNT(*) as Toplam, COUNT(CASE WHEN QRYAYINLANIR = 1 THEN 1 END) as QRYayinlanan FROM STOK
```

## 🔄 Güncelleme Geçmişi

- **v1.0**: Temel ERP entegrasyonu
- **v1.1**: QR filtreleme eklendi
- **v1.2**: Test modülü eklendi
- **v1.3**: Tablo yapısı güncellendi (STOK_GRUP ve STOK)
- **v1.4**: Hiyerarşik kategori desteği eklendi
