import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { filterMenuItems, getCurrentUser } from '../utils/permissions';
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
import '../css/Sidebar.css';

const SidebarMenu = ({ setSelectedComponent, onLogout }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Kullanıcı bilgisini al
  const user = getCurrentUser();

  // Menü öğelerini filtrele
  useEffect(() => {
    const filtered = filterMenuItems(items, user);
    setFilteredItems(filtered);
  }, [user]);

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

    if (e.key !== 'productManagement') {
      setSelectedComponent(e.key);
      if (isMobile) {
        setMobileMenuOpen(false);
      }
      
      // Navigation mapping
      const navigationMap = {
        'Foods': '/products',
        'Sort': '/products/sort',
        'Categories': '/categories',
        'Branches': '/branches',
        'GeneralQR': '/qr/general',
        'QRDesigns': '/qr/designs',
        'Price Changing': '/price-change',
        'Roles': '/users',
        'Auth': '/auth',
        'Profile': '/profile',
        'Logout': null, // Çıkış için route yok
      };
      
      const targetPath = navigationMap[e.key];
      if (targetPath) {
        navigate(targetPath);
      }
    }
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const items = [
    {
      key: 'productManagement',
      icon: <ProductOutlined />,
      label: 'Ürün Yönetimi',
      children: [
        { key: 'Foods', label: 'Ürünler' },
        { key: 'Sort', label: 'Ürün Sıralama' },
      ],
    },
    {
      key: 'CategoryManagement',
      icon: <GroupOutlined />,
      label: 'Kategori Yönetimi',
      children: [
        { key: 'Categories', label: 'Ana Kategoriler' },
        { key: 'Sort', label: 'Kategori Sıralama' },
      ],
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
            { key: 'DesignSettings', label: 'QR Tasarım Ayarları' },
          ],
        },
        {
          key: 'NonOrderableQR',
          label: 'Siparişsiz QR',
          children: [
            { key: 'GeneralQR', label: 'Tekil QR Oluştur' },
            { key: 'QRDesigns', label: 'QR Tasarımları' },
          ],
        },
      ],
    },
    {
      key: 'CampaingsAndIngredients',
      icon: <GiftFilled />,
      label: 'Kampanya ve Bileşenler',
      children: [
        {key:'DaySMenu', label:'Günün Menüsü'},
        { key: 'Campaigns', label: 'Kampanyalar' },
        {key:'DiscountedProducts',label:'İndirimli Ürünler'},
        { key: 'Ingredients', label: 'İçerikler (Malzemeler)' },
        { key: 'Labels', label: 'Etiketler' },
      ],
    },
    { key: 'Price Changing', label: 'Fiyat Değişikliği',icon:<PoundCircleOutlined/> },
    {
      key: 'UserManagement',
      icon: <UsergroupAddOutlined />,
      label: 'Kullanıcı Yönetimi',
      children: [
        { key: 'Roles', label: 'Kullanıcılar ve Roller ' },
        { key: 'Auth', label: 'Yetkilendirmeler' },
      ],
    },
    {
      key: 'Branches',
      icon: <UsergroupAddOutlined />,
      label: 'Şube Yönetimi',
    },
    { key: 'Profile', icon: <UserOutlined />, label: 'Profil ' },
    {
      key: 'GeneralSettings',
      icon: <SettingFilled />,
      label: 'Genel Ayarlar',
      children: [
        { key: 'Settings', label: 'Ayarlar' },
        { key: 'ThemeSettings', label: 'Tema Ayarları' },
        { key: 'Subscription', label: 'Abonelik Ayarları' },
        { key: 'Language', label: 'Dil Ayarları' },
      ],
    },
    { key: 'Logout', icon: <LogoutOutlined />, label: 'Çıkış Yap' },
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
            <span onClick={toggleCollapsed} className="collapse-btn">
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
          </div>
          <div className="menu-scroll-container">
            <Menu
              mode="inline"
              theme="dark"
              inlineCollapsed={collapsed}
              items={filteredItems}
              onClick={handleClick}
              openKeys={openKeys}
              onOpenChange={handleOpenChange}
              defaultSelectedKeys={['Foods']}
              className="scrollable-menu"
            />
          </div>
        </div>
      )}

      {/* Mobile bottom sheet menu */}
      {isMobile && (
        <div className={`mobile-bottom-sheet ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <span>Menü</span>
            <span onClick={toggleMobileMenu} className="close-btn">
              ✕
            </span>
          </div>
          <div className="mobile-menu-scroll-container">
            <Menu
              mode="inline"
              theme="dark"
              items={filteredItems}
              onClick={handleClick}
              openKeys={openKeys}
              onOpenChange={handleOpenChange}
              defaultSelectedKeys={['Foods']}
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
