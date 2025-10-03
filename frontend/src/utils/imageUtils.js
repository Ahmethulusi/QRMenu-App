/**
 * Resim URL'lerini işlemek için yardımcı fonksiyonlar
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Resim URL'sini işler ve tam URL döndürür
 * Cloudflare URL'leri için doğrudan URL'yi döndürür
 * Yerel dosyalar için API_URL ile birleştirir
 * 
 * @param {string} imageUrl - Resim URL'si veya yolu
 * @param {string} type - Resim türü (product, category, logo, vs.)
 * @returns {string} Tam resim URL'si
 */
export const getImageUrl = (imageUrl, type = 'product') => {
  if (!imageUrl) {
    // Resim yoksa varsayılan resim döndür
    return `${API_URL}/public/images/default-${type}.png`;
  }
  
  // Cloudflare URL'si ise doğrudan döndür
  if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
    return imageUrl;
  }
  
  // Yerel dosya ise API_URL ile birleştir
  // URL'nin başında / varsa kaldır
  const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
  
  // Resim türüne göre yolu belirle
  let basePath = 'public/images';
  if (type === 'logo' || type === 'business_logo') {
    basePath = 'public/logos';
  } else if (type === 'banner' || type === 'business_banner') {
    basePath = 'public/images/banners';
  } else if (type === 'welcome_background') {
    basePath = 'public/images/welcome_backgrounds';
  }
  
  // Eğer path zaten basePath içeriyorsa, doğrudan API_URL ile birleştir
  if (cleanPath.includes(basePath)) {
    return `${API_URL}/${cleanPath}`;
  }
  
  // Aksi halde basePath ekleyerek birleştir
  return `${API_URL}/${basePath}/${cleanPath}`;
};

/**
 * Cloudflare URL'si olup olmadığını kontrol eder
 * 
 * @param {string} url - Kontrol edilecek URL
 * @returns {boolean} URL'nin Cloudflare URL'si olup olmadığı
 */
export const isCloudflareUrl = (url) => {
  if (!url) return false;
  return url.includes('r2.dev') || url.includes('cloudflare');
};

/**
 * Backend'den gelen ürün nesnesinden resim URL'sini alır
 * Öncelikle cloudUrl'i kontrol eder, yoksa image_url'i kullanır
 * 
 * @param {Object} product - Ürün nesnesi
 * @returns {string} Resim URL'si
 */
export const getProductImageUrl = (product) => {
  if (!product) return null;
  
  // Önce cloudurl'i kontrol et (küçük harfle)
  if (product.cloudurl) {
    return product.cloudurl;
  }
  
  // Sonra image_url'i kontrol et
  if (product.image_url) {
    return getImageUrl(product.image_url, 'product');
  }
  
  // Resim yoksa null döndür
  return null;
};
