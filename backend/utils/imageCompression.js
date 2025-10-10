const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Görsel Sıkıştırma Servisi
 * 
 * Bu servis, görselleri Cloudflare'e yüklemeden önce sıkıştırır.
 * Hedef: Maksimum 500-600 KB dosya boyutu
 */
class ImageCompressionService {
  constructor() {
    // Sıkıştırma konfigürasyonları
    this.config = {
      // Maksimum dosya boyutu (KB)
      maxSizeKB: 600,
      
      // Kalite ayarları (1-100)
      quality: {
        jpeg: 85,
        webp: 85,
        png: 90
      },
      
      // Maksimum boyutlar (piksel)
      maxDimensions: {
        product: { width: 1920, height: 1920 },
        logo: { width: 512, height: 512 },
        business_logo: { width: 512, height: 512 },
        announcement: { width: 1920, height: 1080 },
        category: { width: 800, height: 800 },
        avatar: { width: 512, height: 512 },
        business_banner: { width: 1920, height: 1080 },
        welcome_background: { width: 1920, height: 1080 }
      }
    };
  }

  /**
   * Dosya boyutunu KB cinsinden döndürür
   */
  async getFileSizeKB(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size / 1024;
  }

  /**
   * Görseli sıkıştırır ve optimize eder
   * @param {string} inputPath - Orijinal dosya yolu
   * @param {string} type - Görsel tipi (product, logo, vb.)
   * @param {string} mimeType - Dosya MIME tipi
   * @returns {Promise<Object>} - Sıkıştırılmış dosya bilgileri
   */
  async compressImage(inputPath, type = 'product', mimeType = 'image/jpeg') {
    try {
      const startTime = Date.now();
      const originalSizeKB = await this.getFileSizeKB(inputPath);
      
      console.log(`📸 Görsel sıkıştırma başlıyor: ${path.basename(inputPath)}`);
      console.log(`📏 Orijinal boyut: ${originalSizeKB.toFixed(2)} KB`);

      // Dosya zaten yeterince küçükse sıkıştırmaya gerek yok
      if (originalSizeKB <= this.config.maxSizeKB) {
        console.log(`✅ Dosya zaten yeterince küçük, sıkıştırma gerekmiyor`);
        return {
          compressed: false,
          originalPath: inputPath,
          outputPath: inputPath,
          originalSizeKB: originalSizeKB,
          finalSizeKB: originalSizeKB,
          compressionRatio: 1,
          processingTime: 0
        };
      }

      // Sharp ile görseli yükle
      let image = sharp(inputPath);
      const metadata = await image.metadata();
      
      console.log(`🔍 Görsel bilgileri: ${metadata.width}x${metadata.height}, Format: ${metadata.format}`);

      // Boyut sınırlamalarını al
      const dimensions = this.config.maxDimensions[type] || this.config.maxDimensions.product;

      // Görseli yeniden boyutlandır (aspect ratio korunur)
      if (metadata.width > dimensions.width || metadata.height > dimensions.height) {
        image = image.resize(dimensions.width, dimensions.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
        console.log(`📐 Görsel yeniden boyutlandırılıyor: Max ${dimensions.width}x${dimensions.height}`);
      }

      // Çıktı dosya yolu
      const outputPath = inputPath.replace(/\.(jpg|jpeg|png|webp)$/i, '_compressed.$1');

      // Format ve kaliteye göre sıkıştır
      let quality = this.config.quality.jpeg;
      
      if (mimeType.includes('webp')) {
        quality = this.config.quality.webp;
        await image
          .webp({ quality, effort: 6 })
          .toFile(outputPath);
      } else if (mimeType.includes('png')) {
        quality = this.config.quality.png;
        await image
          .png({ quality, compressionLevel: 9, adaptiveFiltering: true })
          .toFile(outputPath);
      } else {
        // JPEG (varsayılan)
        quality = this.config.quality.jpeg;
        await image
          .jpeg({ quality, progressive: true, mozjpeg: true })
          .toFile(outputPath);
      }

      // Sıkıştırılmış dosya boyutunu kontrol et
      let finalSizeKB = await this.getFileSizeKB(outputPath);
      let currentQuality = quality;

      // Eğer hala çok büyükse, kaliteyi düşürerek tekrar dene
      let attempts = 0;
      while (finalSizeKB > this.config.maxSizeKB && currentQuality > 60 && attempts < 3) {
        attempts++;
        currentQuality -= 10;
        
        console.log(`🔄 Dosya hala büyük (${finalSizeKB.toFixed(2)} KB), kalite düşürülüyor: ${currentQuality}`);
        
        image = sharp(inputPath);
        if (metadata.width > dimensions.width || metadata.height > dimensions.height) {
          image = image.resize(dimensions.width, dimensions.height, {
            fit: 'inside',
            withoutEnlargement: true
          });
        }

        if (mimeType.includes('webp')) {
          await image.webp({ quality: currentQuality, effort: 6 }).toFile(outputPath);
        } else if (mimeType.includes('png')) {
          await image.png({ quality: currentQuality, compressionLevel: 9 }).toFile(outputPath);
        } else {
          await image.jpeg({ quality: currentQuality, progressive: true, mozjpeg: true }).toFile(outputPath);
        }

        finalSizeKB = await this.getFileSizeKB(outputPath);
      }

      // Orijinal dosyayı sil
      await fs.unlink(inputPath).catch(err => 
        console.error(`⚠️ Orijinal dosya silinemedi: ${err.message}`)
      );

      // Sıkıştırılmış dosyayı orijinal isimle yeniden adlandır
      await fs.rename(outputPath, inputPath);

      const processingTime = Date.now() - startTime;
      const compressionRatio = ((1 - (finalSizeKB / originalSizeKB)) * 100).toFixed(2);

      console.log(`✅ Sıkıştırma tamamlandı!`);
      console.log(`📊 Yeni boyut: ${finalSizeKB.toFixed(2)} KB`);
      console.log(`📉 Sıkıştırma oranı: %${compressionRatio}`);
      console.log(`⏱️ İşlem süresi: ${processingTime}ms`);

      return {
        compressed: true,
        originalPath: inputPath,
        outputPath: inputPath,
        originalSizeKB: originalSizeKB,
        finalSizeKB: finalSizeKB,
        compressionRatio: parseFloat(compressionRatio),
        processingTime: processingTime,
        attempts: attempts + 1
      };

    } catch (error) {
      console.error(`❌ Görsel sıkıştırma hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Birden fazla görseli sıkıştırır
   * @param {Array} files - Dosya listesi
   * @param {string} type - Görsel tipi
   * @returns {Promise<Array>} - Sıkıştırma sonuçları
   */
  async compressMultipleImages(files, type = 'product') {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.compressImage(file.path, type, file.mimetype);
        results.push({
          file: file,
          result: result,
          success: true
        });
      } catch (error) {
        console.error(`❌ ${file.filename} sıkıştırılamadı: ${error.message}`);
        results.push({
          file: file,
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  /**
   * Görsel mi kontrol eder
   */
  isImage(mimeType) {
    return mimeType && mimeType.startsWith('image/') && !mimeType.includes('svg');
  }

  /**
   * Sıkıştırma istatistiklerini formatlar
   */
  formatStats(results) {
    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    const successful = results.filter(r => r.success);
    const totalOriginalSize = successful.reduce((sum, r) => sum + (r.result.originalSizeKB || 0), 0);
    const totalFinalSize = successful.reduce((sum, r) => sum + (r.result.finalSizeKB || 0), 0);
    const averageCompressionRatio = successful.reduce((sum, r) => sum + (r.result.compressionRatio || 0), 0) / successful.length;

    return {
      totalFiles: results.length,
      successfulCompressions: successful.length,
      failedCompressions: results.length - successful.length,
      totalOriginalSizeMB: (totalOriginalSize / 1024).toFixed(2),
      totalFinalSizeMB: (totalFinalSize / 1024).toFixed(2),
      totalSavedMB: ((totalOriginalSize - totalFinalSize) / 1024).toFixed(2),
      averageCompressionRatio: averageCompressionRatio.toFixed(2) + '%'
    };
  }
}

module.exports = ImageCompressionService;

