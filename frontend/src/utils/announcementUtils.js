/**
 * Duyuru işlemleri için yardımcı fonksiyonlar
 */

import { getImageUrl } from './imageUtils';

/**
 * Duyuru resmi URL'sini alır
 * Öncelikle imagecloudurl'i kontrol eder, yoksa image_url'i kullanır
 * 
 * @param {Object} announcement - Duyuru nesnesi
 * @returns {string} Resim URL'si
 */
export const getAnnouncementImageUrl = (announcement) => {
  if (!announcement) return null;
  
  // Önce imagecloudurl'i kontrol et (küçük harfle)
  if (announcement.imagecloudurl) {
    return announcement.imagecloudurl;
  }
  
  // Sonra image_url'i kontrol et
  if (announcement.image_url) {
    return getImageUrl(announcement.image_url, 'announcement');
  }
  
  // Resim yoksa null döndür
  return null;
};

/**
 * Duyuru arkaplan resmi URL'sini alır
 * Öncelikle backgroundimagecloudurl'i kontrol eder, yoksa background_image_url'i kullanır
 * 
 * @param {Object} announcement - Duyuru nesnesi
 * @returns {string} Arkaplan resmi URL'si
 */
export const getAnnouncementBackgroundImageUrl = (announcement) => {
  if (!announcement) return null;
  
  // Önce backgroundimagecloudurl'i kontrol et (küçük harfle)
  if (announcement.backgroundimagecloudurl) {
    return announcement.backgroundimagecloudurl;
  }
  
  // Sonra background_image_url'i kontrol et
  if (announcement.background_image_url) {
    return getImageUrl(announcement.background_image_url, 'announcement');
  }
  
  // Arkaplan resmi yoksa null döndür
  return null;
};
