# ERP Test Modülü - Frontend

Bu modül, ERP entegrasyonu için SQL Server bağlantı testlerini ve sorgu testlerini yapmanızı sağlar.

## 🎯 Özellikler

- **🔧 ERP Bağlantı Ayarları**: SQL Server bağlantı bilgilerini yapılandırın
- **🧪 Bağlantı Testi**: SQL Server'a bağlanabildiğinizi doğrulayın
- **📊 Otomatik Test Sorguları**: Veritabanı yapısını otomatik olarak test edin
- **🔍 Özel Sorgu Testi**: Kendi SQL sorgularınızı çalıştırın
- **📋 Detaylı Sonuçlar**: Tüm test sonuçlarını görsel olarak inceleyin

## 🚀 Kullanım

### 1. Menüden Erişim

Sol menüden **"ERP Test"** seçeneğini tıklayın.

### 2. Bağlantı Ayarları

```
SQL Server Adresi: localhost (veya IP adresi)
Port: 1433 (varsayılan)
Veritabanı Adı: BabirDB (veya kendi veritabanınız)
Kullanıcı Adı: sa (veya kullanıcı adınız)
Şifre: SQL Server şifreniz
```

### 3. Test Adımları

#### Adım 1: Bağlantı Testi
- Konfigürasyonu kaydedin
- **"Bağlantıyı Test Et"** butonuna tıklayın
- Başarılı bağlantı mesajını bekleyin

#### Adım 2: Otomatik Test Sorguları
- **"Otomatik Test Sorguları"** butonuna tıklayın
- Aşağıdaki testler otomatik olarak çalıştırılır:
  - 📊 Veritabanları listesi
  - 📋 Tablolar listesi
  - 🏷️ Stok Grupları (ilk 10 kayıt)
  - 📦 Stok (ilk 10 kayıt)
  - 🔧 Tablo yapıları

#### Adım 3: Özel Sorgu Testi
- **"Özel Sorgu Testi"** bölümünde SQL sorgunuzu yazın
- **"Sorguyu Çalıştır"** butonuna tıklayın
- Sonuçları inceleyin

## 📋 Test Senaryoları

### Senaryo 1: İlk Kurulum
```
1. ERP Test menüsüne gidin
2. Bağlantı bilgilerini girin
3. Konfigürasyonu kaydedin
4. Bağlantıyı test edin
5. Otomatik test sorgularını çalıştırın
```

### Senaryo 2: QR Yayın Kontrolü
```
1. Otomatik test sorgularını çalıştırın
2. "QR Yayın İstatistikleri" panelini açın
3. Kaç ürün/kategori QR'da yayınlanacak kontrol edin
4. QRYAYINLANIR = 1 olan kayıtları doğrulayın
```

### Senaryo 3: Veri Yapısı Kontrolü
```
1. "STOK_GRUP Tablo Yapısı" panelini açın
2. "STOK Tablo Yapısı" panelini açın
3. Gerekli kolonların varlığını kontrol edin:
   - KOD, AD, AKTIF, QRYAYINLANIR
   - QR_MENU_SIRA, USTID (STOK_GRUP için)
   - KALORI, PISIRME_SURESI (STOK için)
```

## 🔧 Örnek Sorgular

### QR Yayınlanan Kategoriler
```sql
SELECT * FROM STOK_GRUP 
WHERE AKTIF = 1 AND QRYAYINLANIR = 1
```

### QR Yayınlanan Ürünler
```sql
SELECT * FROM STOK 
WHERE AKTIF = 1 AND QRYAYINLANIR = 1
```

### Ürünler ve Kategorileri
```sql
SELECT s.KOD, s.AD, sg.AD as GrupAdi 
FROM STOK s 
INNER JOIN STOK_GRUP sg ON s.STOK_GRUP = sg.KOD 
WHERE s.AKTIF = 1 AND s.QRYAYINLANIR = 1
```

### QR Yayın İstatistikleri
```sql
SELECT 
  COUNT(*) as ToplamUrun, 
  COUNT(CASE WHEN QRYAYINLANIR = 1 THEN 1 END) as QRYayinlanan 
FROM STOK 
WHERE AKTIF = 1
```

## ⚠️ Hata Durumları

### Bağlantı Hatası
```
Hata: "Bağlantı hatası: Login failed for user 'sa'"
Çözüm: Kullanıcı adı ve şifreyi kontrol edin
```

### Tablo Bulunamadı
```
Hata: "Invalid object name 'StokGruplari'"
Çözüm: Tablo adını ve veritabanını kontrol edin
```

### Yetki Hatası
```
Hata: "The SELECT permission was denied"
Çözüm: Kullanıcının gerekli yetkilere sahip olduğundan emin olun
```

## 🎨 UI Özellikleri

- **Responsive Tasarım**: Mobil ve desktop uyumlu
- **Dark Mode Desteği**: Sistem tercihine göre otomatik
- **Loading States**: Tüm işlemler için loading göstergeleri
- **Error Handling**: Kapsamlı hata mesajları
- **Collapsible Panels**: Sonuçları düzenli görüntüleme

## 🔒 Güvenlik

- Tüm API çağrıları authentication gerektirir
- SQL injection koruması backend'de sağlanır
- Bağlantı bilgileri güvenli şekilde saklanır
- Sadece yetkili kullanıcılar erişebilir

## 📱 Mobil Uyumluluk

- Responsive grid sistemi
- Mobilde dikey buton düzeni
- Touch-friendly interface
- Optimized table görünümü

## 🚀 Gelecek Geliştirmeler

- [ ] Test sonuçlarını export etme
- [ ] Test geçmişi kaydetme
- [ ] Otomatik test zamanlaması
- [ ] Email bildirimleri
- [ ] Test raporları oluşturma
- [ ] Batch test işlemleri

## 💡 İpuçları

1. **İlk test**: Her zaman bağlantı testi ile başlayın
2. **Veri kontrolü**: Otomatik testleri çalıştırmadan önce bağlantıyı doğrulayın
3. **Hata ayıklama**: Detaylı hata mesajlarını dikkatle okuyun
4. **Performans**: Büyük veri setlerinde TOP ile sınırlayın
5. **Güvenlik**: Test ortamında çalışın, production'da dikkatli olun

## 🆘 Destek

Herhangi bir sorun yaşarsanız:

1. Console loglarını kontrol edin
2. Network sekmesinde API çağrılarını inceleyin
3. Backend loglarını kontrol edin
4. Geliştirici ekibi ile iletişime geçin
