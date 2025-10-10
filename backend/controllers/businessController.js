const { Business, BusinessTranslation, Language } = require('../models');
const path = require('path');
const fs = require('fs').promises;
const { CloudflareService } = require('../middleware/cloudflareMiddleware');

// Get business profile
const getBusinessProfile = async (req, res) => {
  try {
    const { business_id } = req.user;

    const business = await Business.findOne({
      where: { id: business_id },
      include: [
        {
          model: BusinessTranslation,
          as: 'translations',
          include: [
            {
              model: Language,
              as: 'language'
            }
          ]
        }
      ]
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    res.json({
      success: true,
      data: business
    });

  } catch (error) {
    console.error('Error fetching business profile:', error);
    res.status(500).json({
      success: false,
      message: 'İşletme profili getirilirken hata oluştu',
      error: error.message
    });
  }
};

// Update business profile
const updateBusinessProfile = async (req, res) => {
  try {
    const { business_id } = req.user;
    const {
      name,
      custom_domain,
      website_url,
      instagram_url,
      facebook_url,
      twitter_url,
      linkedin_url,
      youtube_url,
      phone,
      email,
      address,
      about_text,
      slogan,
      opening_hours
    } = req.body;

    // Find business
    const business = await Business.findOne({
      where: { id: business_id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    // Update business data
    const updateData = {
      name,
      custom_domain,
      website_url,
      instagram_url,
      facebook_url,
      twitter_url,
      linkedin_url,
      youtube_url,
      phone,
      email,
      address,
      about_text,
      slogan,
      opening_hours,
      updated_at: new Date()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await business.update(updateData);

    // Get updated business with translations
    const updatedBusiness = await Business.findOne({
      where: { id: business_id },
      include: [
        {
          model: BusinessTranslation,
          as: 'translations',
          include: [
            {
              model: Language,
              as: 'language'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'İşletme profili başarıyla güncellendi',
      data: updatedBusiness
    });

  } catch (error) {
    console.error('Error updating business profile:', error);
    res.status(500).json({
      success: false,
      message: 'İşletme profili güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Upload logo
const uploadLogo = async (req, res) => {
  try {
    const { business_id } = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Logo dosyası yüklenmedi'
      });
    }

    // Find business
    const business = await Business.findOne({
      where: { id: business_id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    // Eski logo Cloudflare'den sil (eğer varsa)
    if (business.logocloudpath) {
      const cloudflareService = new CloudflareService();
      try {
        await cloudflareService.deleteFile(business.logocloudpath);
        console.log(`✅ Eski logo Cloudflare'den silindi: ${business.logocloudpath}`);
      } catch (cloudflareError) {
        console.error(`⚠️ Cloudflare'den eski logo silinemedi: ${cloudflareError.message}`);
        // Hata olsa bile işleme devam et
      }
    }

    // Delete old logo from local disk if exists
    if (business.logo) {
      try {
        const oldLogoPath = path.join(__dirname, '..', 'public', 'logos', business.logo);
        await fs.unlink(oldLogoPath);
      } catch (error) {
        console.log('Old logo file not found or could not be deleted:', error.message);
      }
    }

    // Update logo path - sadece dosya adını kaydet
    const logoFileName = req.file.filename;
    
    // Cloudflare bilgilerini al
    const logoCloudUrl = req.file.cloudUrl || null;
    const logoCloudPath = req.file.cloudPath || null;
    const compressionStats = req.file.compressionStats || null;
    
    console.log('☁️ Logo yükleme - Cloudflare bilgileri:', {
      logoCloudUrl,
      logoCloudPath
    });

    // Sıkıştırma istatistiklerini logla
    if (compressionStats) {
      if (compressionStats.compressed) {
        console.log('📊 Logo Sıkıştırma İstatistikleri:');
        console.log(`   • Orijinal Boyut: ${compressionStats.originalSizeKB.toFixed(2)} KB`);
        console.log(`   • Sıkıştırılmış Boyut: ${compressionStats.finalSizeKB.toFixed(2)} KB`);
        console.log(`   • Tasarruf Oranı: %${compressionStats.compressionRatio}`);
        console.log(`   • İşlem Süresi: ${compressionStats.processingTime}ms`);
      } else {
        console.log('ℹ️ Logo zaten optimize edilmiş, sıkıştırma atlandı');
      }
    }
    
    await business.update({
      logo: logoFileName,
      logocloudurl: logoCloudUrl,  // Cloudflare URL'ini kaydet (küçük harfle)
      logocloudpath: logoCloudPath, // Cloudflare Path'ini kaydet (küçük harfle)
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Logo başarıyla yüklendi',
      data: {
        logo: logoFileName,
        cloudUrl: logoCloudUrl,
        cloudPath: logoCloudPath,
        compressionStats: compressionStats
      }
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Logo yüklenirken hata oluştu',
      error: error.message
    });
  }
};

// Upload banner images
const uploadBannerImages = async (req, res) => {
  try {
    const { business_id } = req.user;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Banner görsel dosyası yüklenmedi'
      });
    }

    // Find business
    const business = await Business.findOne({
      where: { id: business_id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    // Eski banner'ları Cloudflare'den sil
    if (business.bannercloudpath) {
      const cloudflareService = new CloudflareService();
      try {
        const oldBannerCloudPaths = JSON.parse(business.bannercloudpath || '[]');
        
        // Her bir eski banner'ı sil
        for (const cloudPath of oldBannerCloudPaths) {
          if (cloudPath) {
            try {
              await cloudflareService.deleteFile(cloudPath);
              console.log(`✅ Eski banner Cloudflare'den silindi: ${cloudPath}`);
            } catch (err) {
              console.error(`⚠️ Banner silinemedi: ${cloudPath}`, err.message);
            }
          }
        }
      } catch (parseError) {
        console.error('Banner cloud path parse edilemedi:', parseError.message);
      }
    }

    // Delete old banner images from local disk if exist
    if (business.banner_images && Array.isArray(business.banner_images)) {
      for (const bannerFileName of business.banner_images) {
        try {
          const oldBannerPath = path.join(__dirname, '..', 'public', 'images', 'banners', bannerFileName);
          await fs.unlink(oldBannerPath);
        } catch (error) {
          console.log('Old banner file not found or could not be deleted:', error.message);
        }
      }
    }

    // Process uploaded files - sadece dosya adlarını kaydet
    const bannerFileNames = req.files.map(file => file.filename);
    
    // Cloudflare bilgilerini al
    const bannerCloudUrls = req.files.map(file => file.cloudUrl || null);
    const bannerCloudPaths = req.files.map(file => file.cloudPath || null);
    
    console.log('☁️ Banner yükleme - Cloudflare bilgileri:', {
      bannerCloudUrls,
      bannerCloudPaths
    });

    // Sıkıştırma istatistiklerini logla
    req.files.forEach((file, index) => {
      const compressionStats = file.compressionStats;
      if (compressionStats) {
        if (compressionStats.compressed) {
          console.log(`📊 Banner ${index + 1} Sıkıştırma İstatistikleri:`);
          console.log(`   • Orijinal Boyut: ${compressionStats.originalSizeKB.toFixed(2)} KB`);
          console.log(`   • Sıkıştırılmış Boyut: ${compressionStats.finalSizeKB.toFixed(2)} KB`);
          console.log(`   • Tasarruf Oranı: %${compressionStats.compressionRatio}`);
          console.log(`   • İşlem Süresi: ${compressionStats.processingTime}ms`);
        } else {
          console.log(`ℹ️ Banner ${index + 1} zaten optimize edilmiş, sıkıştırma atlandı`);
        }
      }
    });

    // Update banner images
    await business.update({
      banner_images: bannerFileNames,
      bannercloudurl: JSON.stringify(bannerCloudUrls),  // Array'i JSON olarak kaydet
      bannercloudpath: JSON.stringify(bannerCloudPaths), // Array'i JSON olarak kaydet
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Banner görselleri başarıyla yüklendi',
      data: {
        banner_images: bannerFileNames,
        cloudUrls: bannerCloudUrls,
        cloudPaths: bannerCloudPaths
      }
    });

  } catch (error) {
    console.error('Error uploading banner images:', error);
    res.status(500).json({
      success: false,
      message: 'Banner görselleri yüklenirken hata oluştu',
      error: error.message
    });
  }
};

// Delete logo
const deleteLogo = async (req, res) => {
  try {
    const { business_id } = req.user;
    const cloudflareService = new CloudflareService();

    // Find business
    const business = await Business.findOne({
      where: { id: business_id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    // Delete logo file from Cloudflare if exists
    if (business.logocloudpath) {
      try {
        await cloudflareService.deleteFile(business.logocloudpath);
        console.log(`✅ Cloudflare'den logo silindi: ${business.logocloudpath}`);
      } catch (cloudflareError) {
        console.error(`⚠️ Cloudflare'den logo silinemedi: ${cloudflareError.message}`);
        // Cloudflare hatası olsa bile işleme devam et
      }
    }

    // Delete logo file from local storage if exists
    if (business.logo) {
      try {
        const logoPath = path.join(__dirname, '..', 'public', 'logos', business.logo);
        await fs.unlink(logoPath);
        console.log(`✅ Yerel diskten logo silindi: ${business.logo}`);
      } catch (error) {
        console.log('Logo file not found or could not be deleted:', error.message);
      }
    }

    // Update business
    await business.update({
      logo: null,
      logocloudurl: null,
      logocloudpath: null,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Logo başarıyla silindi'
    });

  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({
      success: false,
      message: 'Logo silinirken hata oluştu',
      error: error.message
    });
  }
};

// Delete banner image
const deleteBannerImage = async (req, res) => {
  try {
    const { business_id } = req.user;
    const { imagePath, cloudPath } = req.body;
    const cloudflareService = new CloudflareService();

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: 'Silinecek görsel yolu belirtilmedi'
      });
    }

    // Find business
    const business = await Business.findOne({
      where: { id: business_id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    // Remove from banner_images array
    let bannerImages = business.banner_images || [];
    bannerImages = bannerImages.filter(img => img !== imagePath);
    
    // Cloudflare URL ve Path bilgilerini güncelle
    let bannerCloudUrls = [];
    let bannerCloudPaths = [];
    
    try {
      bannerCloudUrls = JSON.parse(business.bannercloudurl || '[]');
      bannerCloudPaths = JSON.parse(business.bannercloudpath || '[]');
    } catch (e) {
      console.error('Banner cloud bilgileri parse edilemedi:', e);
      bannerCloudUrls = [];
      bannerCloudPaths = [];
    }
    
    // Cloudflare'den görseli sil
    if (cloudPath) {
      try {
        await cloudflareService.deleteFile(cloudPath);
        console.log(`✅ Cloudflare'den banner görseli silindi: ${cloudPath}`);
      } catch (cloudflareError) {
        console.error(`⚠️ Cloudflare'den banner görseli silinemedi: ${cloudflareError.message}`);
        // Cloudflare hatası olsa bile işleme devam et
      }
    }
    
    // Cloudflare bilgilerini güncelle
    if (cloudPath && bannerCloudPaths.includes(cloudPath)) {
      const index = bannerCloudPaths.indexOf(cloudPath);
      bannerCloudPaths.splice(index, 1);
      bannerCloudUrls.splice(index, 1);
    } else {
      // Eğer cloudPath verilmemişse, imagePath ile aynı indeksi sil
      const index = bannerImages.indexOf(imagePath);
      if (index !== -1 && index < bannerCloudPaths.length) {
        bannerCloudPaths.splice(index, 1);
        bannerCloudUrls.splice(index, 1);
      }
    }

    // Delete local file
    try {
      const fullImagePath = path.join(__dirname, '..', 'public', 'images', 'banners', imagePath);
      await fs.unlink(fullImagePath);
      console.log(`✅ Yerel diskten banner görseli silindi: ${imagePath}`);
    } catch (error) {
      console.log('Banner image file not found or could not be deleted:', error.message);
    }

    // Update business
    await business.update({
      banner_images: bannerImages,
      bannercloudurl: JSON.stringify(bannerCloudUrls),
      bannercloudpath: JSON.stringify(bannerCloudPaths),
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Banner görseli başarıyla silindi',
      data: {
        banner_images: bannerImages
      }
    });

  } catch (error) {
    console.error('Error deleting banner image:', error);
    res.status(500).json({
      success: false,
      message: 'Banner görseli silinirken hata oluştu',
      error: error.message
    });
  }
};

// Upload welcome background
const uploadWelcomeBackground = async (req, res) => {
  try {
    const { business_id } = req.user;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Welcome background dosyası gereklidir'
      });
    }

    // Find business
    const business = await Business.findOne({
      where: { id: business_id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    // Delete old welcome background if exists
    if (business.welcome_background) {
      const oldImagePath = path.join(__dirname, '../uploads/welcome_backgrounds/', business.welcome_background);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.log('Old welcome background file not found or already deleted');
      }
    }

    // Cloudflare bilgilerini al
    const welcomeBackgroundCloudUrl = req.file.cloudUrl || null;
    const welcomeBackgroundCloudPath = req.file.cloudPath || null;
    
    console.log('☁️ Welcome Background yükleme - Cloudflare bilgileri:', {
      welcomeBackgroundCloudUrl,
      welcomeBackgroundCloudPath
    });

    // Update business with new welcome background
    await business.update({
      welcome_background: req.file.filename,
      welcomebackgroundcloudurl: welcomeBackgroundCloudUrl,
      welcomebackgroundcloudpath: welcomeBackgroundCloudPath,
      updated_at: new Date()
    });

    // Get updated business with translations
    const updatedBusiness = await Business.findOne({
      where: { id: business_id },
      include: [
        {
          model: BusinessTranslation,
          as: 'translations',
          include: [
            {
              model: Language,
              as: 'language'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Welcome background başarıyla yüklendi',
      data: updatedBusiness
    });

  } catch (error) {
    console.error('Error uploading welcome background:', error);
    res.status(500).json({
      success: false,
      message: 'Welcome background yüklenirken hata oluştu',
      error: error.message
    });
  }
};

// Delete welcome background
const deleteWelcomeBackground = async (req, res) => {
  try {
    const { business_id } = req.user;

    // Find business
    const business = await Business.findOne({
      where: { id: business_id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    if (!business.welcome_background) {
      return res.status(400).json({
        success: false,
        message: 'Silinecek welcome background bulunamadı'
      });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '../uploads/welcome_backgrounds/', business.welcome_background);
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.log('Welcome background file not found or already deleted');
    }

    // Update business
    await business.update({
      welcome_background: null,
      welcomebackgroundcloudurl: null,
      welcomebackgroundcloudpath: null,
      updated_at: new Date()
    });

    // Get updated business with translations
    const updatedBusiness = await Business.findOne({
      where: { id: business_id },
      include: [
        {
          model: BusinessTranslation,
          as: 'translations',
          include: [
            {
              model: Language,
              as: 'language'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Welcome background başarıyla silindi',
      data: updatedBusiness
    });

  } catch (error) {
    console.error('Error deleting welcome background:', error);
    res.status(500).json({
      success: false,
      message: 'Welcome background silinirken hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getBusinessProfile,
  updateBusinessProfile,
  uploadLogo,
  uploadBannerImages,
  deleteLogo,
  deleteBannerImage,
  uploadWelcomeBackground,
  deleteWelcomeBackground
};
