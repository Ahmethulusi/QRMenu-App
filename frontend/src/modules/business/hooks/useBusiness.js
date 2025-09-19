import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useBusiness = () => {
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Get business profile
  const fetchBusinessProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${VITE_API_URL}/api/business/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setBusinessProfile(data.data);
      } else {
        message.error(data.message || 'İşletme profili getirilemedi');
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
      message.error('İşletme profili getirilemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update business profile
  const updateBusinessProfile = async (profileData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${VITE_API_URL}/api/business/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (data.success) {
        setBusinessProfile(data.data);
        message.success(data.message || 'İşletme profili başarıyla güncellendi');
        return true;
      } else {
        message.error(data.message || 'İşletme profili güncellenirken hata oluştu');
        return false;
      }
    } catch (error) {
      console.error('Error updating business profile:', error);
      message.error('İşletme profili güncellenirken hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload logo
  const uploadLogo = async (file) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${VITE_API_URL}/api/business/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the business profile with new logo
        if (businessProfile) {
          setBusinessProfile({
            ...businessProfile,
            logo: data.data.logo
          });
        }
        message.success(data.message || 'Logo başarıyla yüklendi');
        return true;
      } else {
        message.error(data.message || 'Logo yüklenirken hata oluştu');
        return false;
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      message.error('Logo yüklenirken hata oluştu');
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Upload banner images
  const uploadBannerImages = async (files) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('banners', file);
      });

      const response = await fetch(`${VITE_API_URL}/api/business/upload-banners`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the business profile with new banner images
        if (businessProfile) {
          setBusinessProfile({
            ...businessProfile,
            banner_images: data.data.banner_images
          });
        }
        message.success(data.message || 'Banner görselleri başarıyla yüklendi');
        return true;
      } else {
        message.error(data.message || 'Banner görselleri yüklenirken hata oluştu');
        return false;
      }
    } catch (error) {
      console.error('Error uploading banner images:', error);
      message.error('Banner görselleri yüklenirken hata oluştu');
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Delete logo
  const deleteLogo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${VITE_API_URL}/api/business/logo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the business profile
        if (businessProfile) {
          setBusinessProfile({
            ...businessProfile,
            logo: null
          });
        }
        message.success(data.message || 'Logo başarıyla silindi');
        return true;
      } else {
        message.error(data.message || 'Logo silinirken hata oluştu');
        return false;
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      message.error('Logo silinirken hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete banner image
  const deleteBannerImage = async (imagePath) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${VITE_API_URL}/api/business/banner-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imagePath })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the business profile
        if (businessProfile) {
          setBusinessProfile({
            ...businessProfile,
            banner_images: data.data.banner_images
          });
        }
        message.success(data.message || 'Banner görseli başarıyla silindi');
        return true;
      } else {
        message.error(data.message || 'Banner görseli silinirken hata oluştu');
        return false;
      }
    } catch (error) {
      console.error('Error deleting banner image:', error);
      message.error('Banner görseli silinirken hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload welcome background
  const uploadWelcomeBackground = async (file) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('welcome_background', file);

      const response = await fetch(`${VITE_API_URL}/api/business/upload-welcome-background`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the business profile with new welcome background
        if (businessProfile) {
          setBusinessProfile({
            ...businessProfile,
            welcome_background: data.data.welcome_background
          });
        }
        message.success(data.message || 'Welcome background başarıyla yüklendi');
        return true;
      } else {
        message.error(data.message || 'Welcome background yüklenirken hata oluştu');
        return false;
      }
    } catch (error) {
      console.error('Error uploading welcome background:', error);
      message.error('Welcome background yüklenirken hata oluştu');
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Delete welcome background
  const deleteWelcomeBackground = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${VITE_API_URL}/api/business/welcome-background`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the business profile
        if (businessProfile) {
          setBusinessProfile({
            ...businessProfile,
            welcome_background: null
          });
        }
        message.success(data.message || 'Welcome background başarıyla silindi');
        return true;
      } else {
        message.error(data.message || 'Welcome background silinirken hata oluştu');
        return false;
      }
    } catch (error) {
      console.error('Error deleting welcome background:', error);
      message.error('Welcome background silinirken hata oluştu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load business profile on mount
  useEffect(() => {
    fetchBusinessProfile();
  }, [fetchBusinessProfile]);

  return {
    businessProfile,
    loading,
    uploading,
    fetchBusinessProfile,
    updateBusinessProfile,
    uploadLogo,
    uploadBannerImages,
    deleteLogo,
    deleteBannerImage,
    uploadWelcomeBackground,
    deleteWelcomeBackground
  };
};
