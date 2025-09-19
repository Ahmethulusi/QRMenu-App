const { Business, BusinessTranslation, Language } = require('../models');
const path = require('path');
const fs = require('fs').promises;

// Get business profile
const getBusinessProfile = async (req, res) => {
  try {
    const { business_id } = req.user;

    const business = await Business.findOne({
      where: { business_id },
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
      where: { business_id }
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
      where: { business_id },
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
      where: { business_id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    // Delete old logo if exists
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
    await business.update({
      logo: logoFileName,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Logo başarıyla yüklendi',
      data: {
        logo: logoFileName
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
      where: { business_id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    // Delete old banner images if exist
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

    // Update banner images
    await business.update({
      banner_images: bannerFileNames,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Banner görselleri başarıyla yüklendi',
      data: {
        banner_images: bannerFileNames
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

    // Find business
    const business = await Business.findOne({
      where: { business_id }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'İşletme bulunamadı'
      });
    }

    // Delete logo file if exists
    if (business.logo) {
      try {
        const logoPath = path.join(__dirname, '..', 'public', 'logos', business.logo);
        await fs.unlink(logoPath);
      } catch (error) {
        console.log('Logo file not found or could not be deleted:', error.message);
      }
    }

    // Update business
    await business.update({
      logo: null,
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
    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: 'Silinecek görsel yolu belirtilmedi'
      });
    }

    // Find business
    const business = await Business.findOne({
      where: { business_id }
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

    // Delete file
    try {
      const fullImagePath = path.join(__dirname, '..', 'public', 'images', 'banners', imagePath);
      await fs.unlink(fullImagePath);
    } catch (error) {
      console.log('Banner image file not found or could not be deleted:', error.message);
    }

    // Update business
    await business.update({
      banner_images: bannerImages,
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
      where: { business_id }
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

    // Update business with new welcome background
    await business.update({
      welcome_background: req.file.filename,
      updated_at: new Date()
    });

    // Get updated business with translations
    const updatedBusiness = await Business.findOne({
      where: { business_id },
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
      where: { business_id }
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
      updated_at: new Date()
    });

    // Get updated business with translations
    const updatedBusiness = await Business.findOne({
      where: { business_id },
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
