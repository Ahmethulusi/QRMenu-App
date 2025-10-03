/**
 * İşletme işlemleri için yardımcı fonksiyonlar
 */

import { getImageUrl } from './imageUtils';

/**
 * İşletme logosu URL'sini alır
 * Öncelikle logocloudurl'i kontrol eder, yoksa logo'yu kullanır
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
  
  // Sonra logo'yu kontrol et
  if (business.logo) {
    return getImageUrl(business.logo, 'business_logo');
  }
  
  // Logo yoksa null döndür
  return null;
};

/**
 * İşletme banner URL'lerini alır
 * Öncelikle bannercloudurl'i kontrol eder, yoksa banner_images'ı kullanır
 * 
 * @param {Object} business - İşletme nesnesi
 * @returns {Array} Banner URL'leri dizisi
 */
export const getBusinessBannerUrls = (business) => {
  if (!business) return [];
  
  // Önce bannercloudurl'i kontrol et (küçük harfle)
  if (business.bannercloudurl) {
    try {
      // bannercloudurl bir JSON string olabilir
      const urls = typeof business.bannercloudurl === 'string'
        ? JSON.parse(business.bannercloudurl)
        : business.bannercloudurl;
        
      if (Array.isArray(urls)) {
        return urls;
      }
      
      // Tek bir URL ise, dizi olarak döndür
      if (typeof urls === 'string') {
        return [urls];
      }
    } catch (error) {
      console.error('Banner URL\'leri ayrıştırılamadı:', error);
    }
  }
  
  // Sonra banner_images'ı kontrol et
  if (business.banner_images) {
    try {
      const images = typeof business.banner_images === 'string'
        ? JSON.parse(business.banner_images)
        : business.banner_images;
        
      if (Array.isArray(images)) {
        return images.map(img => getImageUrl(img, 'business_banner'));
      }
    } catch (error) {
      console.error('Banner resimleri ayrıştırılamadı:', error);
    }
  }
  
  // Banner yoksa boş dizi döndür
  return [];
};

/**
 * İşletme welcome background URL'sini alır
 * Öncelikle welcomebackgroundcloudurl'i kontrol eder, yoksa welcome_background'u kullanır
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
  
  // Sonra welcome_background'u kontrol et
  if (business.welcome_background) {
    return getImageUrl(business.welcome_background, 'welcome_background');
  }
  
  // Welcome background yoksa null döndür
  return null;
};
