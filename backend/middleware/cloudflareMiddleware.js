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
    // Orijinal middleware'den gelen dosya bilgilerini al
    const file = req.file || (req.files ? req.files[0] : null);
    
    if (!file) {
      return next();
    }

    try {
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

      next();
    } catch (error) {
      // Hata durumunda yerel dosyayı temizle
      if (file.path) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Yerel dosya silinirken hata:', unlinkError);
        }
      }
      next(error);
    }
  };
};

module.exports = {
  cloudflareMiddleware,
  CloudflareService
};
