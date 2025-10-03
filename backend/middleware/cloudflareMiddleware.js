const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Cloudflare R2 istemcisini yapılandır
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  }
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const CLOUDFLARE_PUBLIC_URL = process.env.CLOUDFLARE_PUBLIC_URL;

class CloudflareService {
  /**
   * Dosyayı Cloudflare R2'ye yükler
   * @param {string} localPath - Yerel dosya yolu
   * @param {string} destinationPath - R2'deki hedef yol
   * @param {string} contentType - Dosya MIME tipi
   * @returns {Promise<string>} - Yüklenen dosyanın public URL'i
   */
  async uploadFile(localPath, destinationPath, contentType) {
    try {
      const fileContent = await fs.readFile(localPath);
      
      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: destinationPath,
        Body: fileContent,
        ContentType: contentType,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      
      // Public URL oluştur
      const publicUrl = `${CLOUDFLARE_PUBLIC_URL}/${destinationPath}`;
      
      // Başarılı log
      console.log(`📤 Dosya Cloudflare'e yüklendi: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error(`❌ Cloudflare yükleme hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Dosyayı Cloudflare R2'den siler
   * @param {string} cloudPath - R2'deki dosya yolu
   */
  async deleteFile(cloudPath) {
    try {
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Key: cloudPath,
      };

      await s3Client.send(new DeleteObjectCommand(deleteParams));
      console.log(`🗑️ Dosya Cloudflare'den silindi: ${cloudPath}`);
    } catch (error) {
      console.error(`❌ Cloudflare silme hatası: ${error.message}`);
      throw error;
    }
  }

  /**
   * Geçici imzalı URL oluşturur
   * @param {string} cloudPath - R2'deki dosya yolu
   * @param {number} expiresIn - URL'in geçerlilik süresi (saniye)
   * @returns {Promise<string>} - İmzalı URL
   */
  async getSignedUrl(cloudPath, expiresIn = 3600) {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: cloudPath,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error(`❌ İmzalı URL oluşturma hatası: ${error.message}`);
      throw error;
    }
  }
}

// Cloudflare middleware
const cloudflareMiddleware = (type) => {
  const cloudflareService = new CloudflareService();

  return async (req, res, next) => {
    try {
      // Tek dosya durumu
      if (req.file) {
        const file = req.file;
        // Cloudflare'deki hedef yolu oluştur
        const cloudPath = `${type}/${path.basename(file.path)}`;
        
        // Dosyayı Cloudflare'e yükle
        const publicUrl = await cloudflareService.uploadFile(
          file.path,
          cloudPath,
          file.mimetype
        );

        // Yerel dosyayı sil
        await fs.unlink(file.path);
        
        // Request objesini güncelle
        req.file = {
          ...file,
          cloudUrl: publicUrl,
          cloudPath: cloudPath,
          location: publicUrl // S3 uyumluluğu için
        };
        
        console.log(`✅ Cloudflare middleware - Tek dosya işlendi: ${publicUrl}`);
      } 
      // Çoklu dosya durumu (array)
      else if (req.files && Array.isArray(req.files)) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          // Cloudflare'deki hedef yolu oluştur
          const cloudPath = `${type}/${path.basename(file.path)}`;
          
          // Dosyayı Cloudflare'e yükle
          const publicUrl = await cloudflareService.uploadFile(
            file.path,
            cloudPath,
            file.mimetype
          );

          // Yerel dosyayı sil
          await fs.unlink(file.path);
          
          // Dosya bilgilerini güncelle
          req.files[i] = {
            ...file,
            cloudUrl: publicUrl,
            cloudPath: cloudPath,
            location: publicUrl
          };
        }
        console.log(`✅ Cloudflare middleware - ${req.files.length} dosya işlendi`);
      }
      // Çoklu dosya durumu (object - farklı alanlar için)
      else if (req.files && typeof req.files === 'object') {
        for (const fieldName of Object.keys(req.files)) {
          const files = req.files[fieldName];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Cloudflare'deki hedef yolu oluştur
            const cloudPath = `${type}/${fieldName}_${path.basename(file.path)}`;
            
            // Dosyayı Cloudflare'e yükle
            const publicUrl = await cloudflareService.uploadFile(
              file.path,
              cloudPath,
              file.mimetype
            );

            // Yerel dosyayı sil
            await fs.unlink(file.path);
            
            // Dosya bilgilerini güncelle
            files[i] = {
              ...file,
              cloudUrl: publicUrl,
              cloudPath: cloudPath,
              location: publicUrl
            };
          }
        }
        console.log(`✅ Cloudflare middleware - Çoklu alan dosyaları işlendi`);
      }
      // Hiç dosya yoksa
      else {
        console.log('⚠️ Cloudflare middleware - İşlenecek dosya bulunamadı');
      }

      next();
    } catch (error) {
      console.error(`❌ Cloudflare middleware hatası: ${error.message}`);
      
      // Hata durumunda yerel dosyaları temizle
      try {
        if (req.file && req.file.path) {
          await fs.unlink(req.file.path).catch(() => {});
        }
        
        if (req.files) {
          if (Array.isArray(req.files)) {
            for (const file of req.files) {
              if (file.path) await fs.unlink(file.path).catch(() => {});
            }
          } else {
            for (const fieldName of Object.keys(req.files)) {
              for (const file of req.files[fieldName]) {
                if (file.path) await fs.unlink(file.path).catch(() => {});
              }
            }
          }
        }
      } catch (cleanupError) {
        console.error('Yerel dosyalar temizlenirken hata:', cleanupError);
      }
      
      next(error);
    }
  };
};

module.exports = {
  cloudflareMiddleware,
  CloudflareService
};
