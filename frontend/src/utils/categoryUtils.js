/**
 * Kategori işlemleri için yardımcı fonksiyonlar
 */

import { getImageUrl, isCloudflareUrl } from './imageUtils';

/**
 * Kategori nesnesinden resim URL'sini alır
 * Öncelikle cloudurl'i kontrol eder, yoksa imageUrl'i kullanır
 * 
 * @param {Object} category - Kategori nesnesi
 * @returns {string} Resim URL'si
 */
export const getCategoryImageUrl = (category) => {
  if (!category) return null;
  
  // Önce cloudurl'i kontrol et (küçük harfle)
  if (category.cloudurl) {
    console.log('Kategori için Cloudflare URL kullanılıyor:', category.cloudurl);
    return category.cloudurl;
  }
  
  // Sonra imageUrl'i kontrol et
  if (category.imageUrl) {
    console.log('Kategori için imageUrl kullanılıyor:', category.imageUrl);
    return getImageUrl(category.imageUrl, 'category');
  }
  
  // Son olarak image_url'i kontrol et (API'den direkt gelen veri için)
  if (category.image_url) {
    console.log('Kategori için image_url kullanılıyor:', category.image_url);
    return getImageUrl(category.image_url, 'category');
  }
  
  // Resim yoksa null döndür
  return null;
};

/**
 * Kategori listesini işler ve resim URL'lerini ekler
 * 
 * @param {Array} categories - Kategori listesi
 * @returns {Array} İşlenmiş kategori listesi
 */
export const processCategoryList = (categories) => {
  if (!categories || !Array.isArray(categories)) return [];
  
  return categories.map(category => ({
    ...category,
    imageUrl: getCategoryImageUrl(category) || null
  }));
};
