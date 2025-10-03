const { Business, Branch } = require('../models');

const businessController = {
  // İşletme bilgilerini getir
  getBusinessInfo: async (req, res) => {
    try {
      const { businessId } = req.params;
      
      console.log('🏢 Business bilgileri getiriliyor, businessId:', businessId);

      const business = await Business.findByPk(businessId, {
        include: [
          {
            model: Branch,
            as: 'branches',
            attributes: ['branch_id', 'name', 'adress'],
            required: false
          }
        ],
        attributes: [
          'business_id', 
          'name', 
          'logo', 
          'logocloudurl',
          'logocloudpath',
          'banner_images',
          'bannercloudurl',
          'bannercloudpath',
          'welcome_background',
          'welcomebackgroundcloudurl',
          'welcomebackgroundcloudpath',
          'slogan', 
          'website_url', 
          'email', 
          'phone', 
          'address', 
          'about_text',
          'instagram_url',
          'facebook_url',
          'twitter_url',
          'linkedin_url',
          'youtube_url',
          'created_at', 
          'updated_at'
        ]
      });

      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'İşletme bulunamadı'
        });
      }

      const formattedBusiness = {
        id: business.business_id,
        name: business.name,
        description: business.about_text,
        logoUrl: business.logo,
        logoCloudUrl: business.logocloudurl,
        logoCloudPath: business.logocloudpath,
        bannerImages: business.banner_images,
        bannerCloudUrl: business.bannercloudurl,
        bannerCloudPath: business.bannercloudpath,
        welcomeBackground: business.welcome_background,
        welcomeBackgroundCloudUrl: business.welcomebackgroundcloudurl,
        welcomeBackgroundCloudPath: business.welcomebackgroundcloudpath,
        slogan: business.slogan,
        website: business.website_url,
        email: business.email,
        phone: business.phone,
        address: business.address,
        socialMedia: {
          instagram: business.instagram_url,
          facebook: business.facebook_url,
          twitter: business.twitter_url,
          linkedin: business.linkedin_url,
          youtube: business.youtube_url
        },
        branches: business.branches ? business.branches.map(branch => ({
          id: branch.branch_id,
          name: branch.name,
          address: branch.adress
        })) : [],
        createdAt: business.created_at,
        updatedAt: business.updated_at
      };

      console.log('🏢 Business bilgileri başarıyla getirildi:', formattedBusiness.name);

      res.json({
        success: true,
        data: {
          business: formattedBusiness
        }
      });

    } catch (error) {
      console.error('Business bilgileri getirme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'İşletme bilgileri alınırken hata oluştu',
        error: error.message
      });
    }
  },

  // Şube bilgilerini getir
  getBranchInfo: async (req, res) => {
    try {
      const { branchId } = req.params;
      
      console.log('🏪 Branch bilgileri getiriliyor, branchId:', branchId);

      const branch = await Branch.findByPk(branchId, {
        include: [
          {
            model: Business,
            as: 'business',
            attributes: [
              'business_id', 
              'name', 
              'about_text', 
              'logo', 
              'logocloudurl',
              'logocloudpath',
              'banner_images',
              'bannercloudurl',
              'bannercloudpath',
              'welcome_background',
              'welcomebackgroundcloudurl',
              'welcomebackgroundcloudpath',
              'slogan', 
              'website_url', 
              'email', 
              'phone', 
              'address',
              'instagram_url',
              'facebook_url',
              'twitter_url',
              'linkedin_url',
              'youtube_url'
            ]
          }
        ],
        attributes: [
          'branch_id', 
          'business_id', 
          'name', 
          'adress'
        ]
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: 'Şube bulunamadı'
        });
      }

      const formattedBranch = {
        id: branch.branch_id,
        businessId: branch.business_id,
        name: branch.name,
        address: branch.adress,
        business: branch.business ? {
          id: branch.business.business_id,
          name: branch.business.name,
          description: branch.business.about_text,
          logoUrl: branch.business.logo,
          logoCloudUrl: branch.business.logocloudurl,
          logoCloudPath: branch.business.logocloudpath,
          bannerImages: branch.business.banner_images,
          bannerCloudUrl: branch.business.bannercloudurl,
          bannerCloudPath: branch.business.bannercloudpath,
          welcomeBackground: branch.business.welcome_background,
          welcomeBackgroundCloudUrl: branch.business.welcomebackgroundcloudurl,
          welcomeBackgroundCloudPath: branch.business.welcomebackgroundcloudpath,
          slogan: branch.business.slogan,
          website: branch.business.website_url,
          email: branch.business.email,
          phone: branch.business.phone,
          address: branch.business.address,
          socialMedia: {
            instagram: branch.business.instagram_url,
            facebook: branch.business.facebook_url,
            twitter: branch.business.twitter_url,
            linkedin: branch.business.linkedin_url,
            youtube: branch.business.youtube_url
          }
        } : null
      };

      console.log('🏪 Branch bilgileri başarıyla getirildi:', formattedBranch.name);

      res.json({
        success: true,
        data: {
          branch: formattedBranch
        }
      });

    } catch (error) {
      console.error('Branch bilgileri getirme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Şube bilgileri alınırken hata oluştu',
        error: error.message
      });
    }
  }
};

module.exports = businessController;
