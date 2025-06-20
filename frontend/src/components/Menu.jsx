import React, { useState, useEffect, useRef } from 'react';
import '../css/Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

function Menu({ setSelectedComponent }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
=======
  const [menuOpen, setMenuOpen] = useState(window.innerWidth >= 768);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setMenuOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
      if (window.innerWidth >= 768) {
        setMenuOpen(true);
      } else {
        setMenuOpen(false);
      }
    };

    const content = document.querySelector('.content');
    if (content) {
      if (menuOpen) {
        content.style.marginLeft = '180px';
        content.style.width = 'calc(100% - 180px)';
      } else {
        content.style.marginLeft = '0';
        content.style.width = '100%';
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  const handleSelection = (component) => {
    setSelectedComponent(component);
    if (isMobile) {
    if (window.innerWidth <= 768) {
      setMenuOpen(false);
    }
  };

  return (
    <>
      <div className={`menu-icon`} onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} />
      </div>

      <nav className={`menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
        <ul>
          <li
            className="side-link"
            onClick={() => handleSelection('Foods')}
          >
            Ürünler
          </li>
          <li
            className="side-link"
            onClick={() => handleSelection('Sort')}
          >
            Sıralama
          </li>
          {/* <li
            className="side-link"
            onClick={() => {
              setSelectedComponent('Menus');
            }}
          >
            Menüler
          </li> */}
          <li
            className="side-link"
            onClick={() => handleSelection('Categories')}
          >
            Kategoriler
          </li>
          <li
            className="side-link"
            onClick={() => handleSelection('Price Changing')}
          >
            Fiyat Değişikliği
          </li>
          {/* <li
            className="side-link"
            onClick={() => {
              setSelectedComponent('Home Page');
            }}
          >
            Home Page
          </li> */}
        </ul>
      </nav>

      {isMobile && (
        <div
          className={`overlay ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
        ></div>
      )}
    </>
  );
}

export default Menu;
