/**
 * İşletme profili görsel işlemleri için yardımcı fonksiyonlar
 */

import { getImageUrl } from './imageUtils';

/**
 * İşletme logo URL'sini alır
 * Öncelikle logocloudurl'i kontrol eder, yoksa logo alanını kullanır
 * 
 * @param {Object} business - İşletme nesnesi
 * @returns {string} Logo URL'si
 */
export const getBusinessLogoUrl = (business) => {
  if (!business) return null;
  
  // Önce logocloudurl'i kontrol et (küçük harfle)
  if (business.logocloudurl) {
    return business.logocloudurl;
  }
  
  // Sonra logo alanını kontrol et
  if (business.logo) {
    return getImageUrl(business.logo, 'logos');
  }
  
  // Logo yoksa null döndür
  return null;
};

/**
 * İşletme banner görsellerinin URL'lerini alır
 * Öncelikle bannercloudurl'i kontrol eder, yoksa banner_images alanını kullanır
 * 
 * @param {Object} business - İşletme nesnesi
 * @returns {Array} Banner URL'leri dizisi
 */
export const getBusinessBannerUrls = (business) => {
  if (!business) return [];
  
  // Önce bannercloudurl'i kontrol et (küçük harfle)
  if (business.bannercloudurl) {
    // Eğer JSON string ise parse et
    try {
      if (typeof business.bannercloudurl === 'string') {
        const parsed = JSON.parse(business.bannercloudurl);
        // Parse edilmiş veriyi kontrol et
        if (Array.isArray(parsed)) {
          // Null veya undefined değerleri filtrele
          return parsed.filter(url => url !== null && url !== undefined);
        }
        return [];
      }
      // Eğer zaten dizi ise doğrudan döndür ve null değerleri filtrele
      if (Array.isArray(business.bannercloudurl)) {
        return business.bannercloudurl.filter(url => url !== null && url !== undefined);
      }
    } catch (error) {
      console.error('Banner cloud URL parse hatası:', error);
      return [];
    }
  }
  
  // Sonra banner_images alanını kontrol et
  if (business.banner_images) {
    // Eğer JSON string ise parse et
    try {
      if (typeof business.banner_images === 'string') {
        const bannerImages = JSON.parse(business.banner_images);
        // Null veya undefined değerleri filtrele
        if (Array.isArray(bannerImages)) {
          return bannerImages
            .filter(image => image !== null && image !== undefined)
            .map(image => getImageUrl(image, 'banners'));
        }
        return [];
      }
      // Eğer zaten dizi ise URL'leri oluştur ve null değerleri filtrele
      if (Array.isArray(business.banner_images)) {
        return business.banner_images
          .filter(image => image !== null && image !== undefined)
          .map(image => getImageUrl(image, 'banners'));
      }
    } catch (error) {
      console.error('Banner images parse hatası:', error);
      return [];
    }
  }
  
  // Banner yoksa boş dizi döndür
  return [];
};

/**
 * İşletme welcome background URL'sini alır
 * Öncelikle welcomebackgroundcloudurl'i kontrol eder, yoksa welcome_background alanını kullanır
 * 
 * @param {Object} business - İşletme nesnesi
 * @returns {string} Welcome background URL'si
 */
export const getBusinessWelcomeBackgroundUrl = (business) => {
  if (!business) return null;
  
  // Önce welcomebackgroundcloudurl'i kontrol et (küçük harfle)
  if (business.welcomebackgroundcloudurl) {
    return business.welcomebackgroundcloudurl;
  }
  
  // Sonra welcome_background alanını kontrol et
  if (business.welcome_background) {
    return getImageUrl(business.welcome_background, 'welcome_backgrounds');
  }
  
  // Welcome background yoksa null döndür
  return null;
};