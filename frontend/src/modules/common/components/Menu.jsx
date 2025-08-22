import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../utils/permissions';
import {
  GiftFilled,
  UsergroupAddOutlined,
  SettingOutlined,
  ProductOutlined,
  SortDescendingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GroupOutlined,
  DesktopOutlined,
  ContainerOutlined,
  PoundCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  QrcodeOutlined,
  SettingFilled,
  MenuOutlined
} from '@ant-design/icons';
import { Menu, Avatar, message } from 'antd';
import '../../../css/Sidebar.css';

const SidebarMenu = ({ setSelectedComponent, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]); // Boş array ile başla
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tokenTimeLeft, setTokenTimeLeft] = useState('');

  // Component yüklendiğinde localStorage'dan selectedComponent'i al
  useEffect(() => {
    const savedComponent = localStorage.getItem('selectedComponent');
    if (savedComponent) {
      setSelectedComponent(savedComponent);
    }
  }, [setSelectedComponent]);

  const navigate = useNavigate();
  const location = useLocation();

  // Kullanıcı bilgisini al
  const user = getCurrentUser();

  // Token süresini hesapla ve güncelle
  const calculateTokenTimeLeft = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setTokenTimeLeft('Token bulunamadı');
        return;
      }

      // JWT token'ı decode et (basit yöntem)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Unix timestamp'i milisaniyeye çevir
      const currentTime = Date.now();
      const timeLeft = expirationTime - currentTime;

      if (timeLeft <= 0) {
        setTokenTimeLeft('Token süresi dolmuş');
        return;
      }

      // Kalan süreyi saat:dakika:saniye formatında göster
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setTokenTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } catch (error) {
      setTokenTimeLeft('Token hatası');
    }
  };

  // Token süresini her saniye güncelle
  useEffect(() => {
    calculateTokenTimeLeft();
    const interval = setInterval(calculateTokenTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  // URL'den hangi sayfada olduğumuzu anla ve selectedComponent'i ayarla
  useEffect(() => {
    const path = location.pathname;
    
    // URL'den component adını belirle
    let componentName = 'Products'; // Varsayılan
    
    if (path === '/products' || path === '/') {
      componentName = 'Products';
    } else if (path === '/products/sort') {
      componentName = 'Sort';
    } else if (path === '/categories') {
      componentName = 'Categories';
    } else if (path === '/labels') {
      componentName = 'Labels';
    } else if (path === '/announcements') {
      componentName = 'Announcements';
    } else if (path === '/campaigns') {
      componentName = 'Campaigns';
    } else if (path === '/daily-menu') {
      componentName = 'DailyMenu';
    } else if (path === '/ingredients') {
      componentName = 'Ingredients';
    } else if (path === '/branches') {
      componentName = 'Branches';
    } else if (path === '/qr/general') {
      componentName = 'GeneralQR';
    } else if (path === '/qr/designs') {
      componentName = 'QRDesigns';
    } else if (path === '/price-change') {
      componentName = 'Price Changing';
    } else if (path === '/users') {
      componentName = 'Roles';
    } else if (path === '/auth') {
      componentName = 'Auth';
    } else if (path === '/profile') {
      componentName = 'Profile';
    } else if (path === '/settings') {
      componentName = 'Settings';
    } else if (path === '/language-settings') {
      componentName = 'LanguageSettings';
    }
    
    setSelectedComponent(componentName);
  }, [location.pathname, setSelectedComponent]);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 900;
      setIsMobile(isNowMobile);
      if (isNowMobile) {
        setCollapsed(true);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const content = document.querySelector('.content');
    if (content) {
      if (!collapsed && !isMobile) {
        content.style.marginLeft = '200px';
        content.style.width = 'calc(100% - 200px)';
      } else if (isMobile && mobileMenuOpen) {
        content.style.marginLeft = '0';
        content.style.width = '100%';
      } else {
        content.style.marginLeft = '0';
        content.style.width = '100%';
      }
    }
  }, [collapsed, isMobile, mobileMenuOpen]);

  const handleClick = async (e) => {
    if (e.key === 'Logout') {
      // Çıkış yapma işlemi
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('token');
        
        if (token) {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }
        
        // LocalStorage'ı temizle
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        message.success('Çıkış başarılı!');
        
        // App.jsx'teki onLogout fonksiyonunu çağır
        if (onLogout) {
          onLogout();
        }
        
        return;
      } catch (error) {
        console.error('Çıkış hatası:', error);
        message.error('Çıkış yapılırken hata oluştu!');
      }
    }

    setSelectedComponent(e.key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
    
    // Navigation mapping
    const navigationMap = {
      'Products': '/products',
      'Sort': '/products/sort',
      'Categories': '/categories',
      'Labels': '/labels',
      'Announcements': '/announcements',
      'Campaigns': '/campaigns',
      'DailyMenu': '/daily-menu',
      'Ingredients': '/ingredients',
      'Branches': '/branches',
      'GeneralQR': '/qr/general',
      'QRDesigns': '/qr/designs',
      'Price Changing': '/price-change',
      'Roles': '/users',
      'Auth': '/auth',
      'Profile': '/profile',
      'Settings': '/settings',
      'LanguageSettings': '/language-settings',
      'Logout': null, // Çıkış için route yok
    };
    
    const targetPath = navigationMap[e.key];
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  // Basit statik menü yapısı
  const items = [
    {
      key: 'productManagement',
      icon: <ProductOutlined />,
      label: 'Ürün Yönetimi',
      children: [
        { key: 'Products', label: 'Ürünler' },
        { key: 'Sort', label: 'Sıralama' },
        { key: 'Price Changing', label: 'Toplu Fiyat Değişikliği' }
      ]
    },
    {
      key: 'CategoryManagement',
      icon: <GroupOutlined />,
      label: 'Kategori Yönetimi',
      children: [
        { key: 'Categories', label: 'Kategoriler' },
        { key: 'CategorySort', label: 'Sıralama' }
      ]
    },
    {
      key: 'ContentManagement',
      icon: <ContainerOutlined />,
      label: 'İçerik Yönetimi',
      children: [
        { key: 'Labels', label: 'Etiketler' },
        { key: 'Announcements', label: 'Duyurular' },
      ]
    },
    {
      key: 'TablesAndQRManagement',
      icon: <QrcodeOutlined />,
      label: 'Masa ve QR Yönetimi',
      children: [
        {
          key: 'OrderableQR',
          label: 'Siparişli QR',
          children: [
            { key: 'TableSections', label: 'Bölümler' },
            { key: 'Tables', label: 'Masalar ve QR Oluştur' },
            { key: 'DesignSettings', label: 'QR Tasarım Ayarları' }
          ]
        },
        {
          key: 'NonOrderableQR',
          label: 'Siparişsiz QR',
          children: [
            { key: 'GeneralQR', label: 'Tekil QR Oluştur' },
            { key: 'QRDesigns', label: 'QR Tasarımları' }
          ]
        }
      ]
    },
    {
      key: 'Branches',
      icon: <UsergroupAddOutlined />,
      label: 'Şube Yönetimi'
    },
    {
      key: 'UserManagement',
      icon: <UsergroupAddOutlined />,
      label: 'Kullanıcı Yönetimi',
      children: [
        { key: 'Roles', label: 'Kullanıcılar ve Roller' },
        { key: 'Auth', label: 'Yetkilendirmeler' }
      ]
    },
    {
      key:       'GeneralSettings',
      icon: <SettingOutlined />,
      label: 'Genel Ayarlar',
      children: [
        { key: 'LanguageSettings', label: 'Dil Ayarları' }
      ]
    },
    { key: 'Profile', icon: <UserOutlined />, label: 'Profil' },
    { key: 'Logout', icon: <LogoutOutlined />, label: 'Çıkış Yap' }
  ];
   
  return (
    <>
      {/* Mobile hamburger menu icon */}
      {isMobile && (
        <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
          <MenuOutlined />
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <div className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="user-info">
              <Avatar size="small" icon={<UserOutlined />} />
              {!collapsed && (
                <>
                  <span className="user-email">{user?.email || 'Kullanıcı'}</span>
                  <span className="token-time-left">Token: {tokenTimeLeft}</span>
                </>
              )}
            </div>
            <span onClick={toggleCollapsed} className="collapse-btn">
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
          </div>
          <div className="menu-scroll-container">
            <Menu
              mode="inline"
              theme="dark"
              inlineCollapsed={collapsed}
              items={items}
              onClick={handleClick}
              openKeys={openKeys}
              onOpenChange={handleOpenChange}
              defaultSelectedKeys={['Products']}
              className="scrollable-menu"
            />
          </div>
        </div>
      )}

      {/* Mobile bottom sheet menu */}
      {isMobile && (
        <div className={`mobile-bottom-sheet ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
                          <div className="mobile-user-info">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="mobile-user-email">{user?.email || 'Kullanıcı'}</span>
                <span className="mobile-token-time-left">Token: {tokenTimeLeft}</span>
              </div>
            <span onClick={toggleMobileMenu} className="close-btn">
              ✕
            </span>
          </div>
          <div className="mobile-menu-scroll-container">
            <Menu
              mode="inline"
              theme="dark"
              items={items}
              onClick={handleClick}
              openKeys={openKeys}
              onOpenChange={handleOpenChange}
              defaultSelectedKeys={['Products']}
              className="mobile-menu-content"
            />
          </div>
        </div>
      )}
      
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}
    </>
  );
};

export default SidebarMenu;