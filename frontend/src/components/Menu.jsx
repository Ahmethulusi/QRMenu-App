// import React, { useState, useEffect, useRef } from 'react';
// import '../css/Sidebar.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBars } from '@fortawesome/free-solid-svg-icons';

// function Menu({ setSelectedComponent }) {
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [menuOpen, setMenuOpen] = useState(window.innerWidth >= 768);
//   const menuRef = useRef(null);

//   const toggleMenu = () => {
//     setMenuOpen(!menuOpen);
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       setMenuOpen(!mobile);
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const content = document.querySelector('.content');
//     if (content) {
//       if (menuOpen) {
//         content.style.marginLeft = '180px';
//         content.style.width = 'calc(100% - 180px)';
//       } else {
//         content.style.marginLeft = '0';
//         content.style.width = '100%';
//       }
//     }
//   }, [menuOpen]);

//   const handleSelection = (component) => {
//     setSelectedComponent(component);
//     if (isMobile) {
//       setMenuOpen(false);
//     }
//   };

//   return (
//     <>
//       <div className={`menu-icon`} onClick={toggleMenu}>
//         <FontAwesomeIcon icon={faBars} />
//       </div>

//       <nav className={`menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
//         <ul>
//           <li
//             className="side-link"
//             onClick={() => handleSelection('Foods')}
//           >
//             Ürünler
//           </li>
//           <li
//             className="side-link"
//             onClick={() => handleSelection('Sort')}
//           >
//             Sıralama
//           </li>
//           {/* <li
//             className="side-link"
//             onClick={() => {
//               setSelectedComponent('Menus');
//             }}
//           >
//             Menüler
//           </li> */}
//           <li
//             className="side-link"
//             onClick={() => handleSelection('Categories')}
//           >
//             Kategoriler
//           </li>
//           <li
//             className="side-link"
//             onClick={() => handleSelection('Price Changing')}
//           >
//             Fiyat Değişikliği
//           </li>
//           {/* <li
//             className="side-link"
//             onClick={() => {
//               setSelectedComponent('Home Page');
//             }}
//           >
//             Home Page
//           </li> */}
//         </ul>
//       </nav>

//       {isMobile && (
//         <div
//           className={`overlay ${menuOpen ? 'open' : ''}`}
//           onClick={toggleMenu}
//         ></div>
//       )}
//     </>
//   );
// }

// export default Menu;
import React, { useState, useEffect } from 'react';
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
  SettingFilled
  // ProfileOutlined
} from '@ant-design/icons';
import { Menu, Avatar } from 'antd';
import '../css/Sidebar.css';

const SidebarMenu = ({ setSelectedComponent }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 768;
      setIsMobile(isNowMobile);
      setCollapsed(isNowMobile);
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
      } else {
        content.style.marginLeft = '80px';
        content.style.width = 'calc(100% - 80px)';
      }
    }
  }, [collapsed, isMobile]);

  const handleClick = (e) => {
  if (e.key !== 'productManagement') {
    setSelectedComponent(e.key);
    if (isMobile) setCollapsed(true);
  }
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
        { key: 'Foods', label: 'Alt Kategoriler' },
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
        { key: 'DesignSettings', label: 'QR Tasarım Ayarları' }, // opsiyonel
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
    // { key: 'TablesAndQR', icon: <QrcodeOutlined />, label: 'Masa Yönetimi' },
    {
      key: 'UserManagement',
      icon: <UsergroupAddOutlined />,
      label: 'Kullanıcı Yönetimi',
      children: [
        { key: 'Roles', label: 'Kullanıcı Roller ' },
        { key: 'BusinessManagement', label: 'İşletme Yönetimi' },
        { key: 'Auth', label: 'Yetkilendirme Ayarları' },
      ],
    },
    { key: 'Profile', icon: <UserOutlined />, label: 'Profil ' },
    // { key: 'GeneralSettings', label: 'Genel Ayarlar',icon:<SettingFilled/> },
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
      <div className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <span onClick={toggleCollapsed} className="collapse-btn">
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          items={items}
          onClick={handleClick}
          defaultSelectedKeys={['Foods']}
        />
      </div>
      {isMobile && !collapsed && (
        <div className="overlay open" onClick={toggleCollapsed}></div>
      )}
    </>
  );
};

export default SidebarMenu;
