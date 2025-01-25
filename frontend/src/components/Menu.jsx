import React, { useState, useEffect, useRef } from 'react';
import '../css/Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

function Menu({ setSelectedComponent }) {
  const [menuOpen, setMenuOpen] = useState(true);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    // Menu kapanınca içerik genişliğini ve margin-left ayarlıyoruz
    const content = document.querySelector('.content');
    if (content) {
      if (menuOpen) {
        content.style.marginLeft = '180px'; // Menu açıkken soldan boşluk
        content.style.width = 'calc(100% - 180px)'; // Genişliği ayarlıyoruz
      } else {
        content.style.marginLeft = '0'; // Menu kapalıyken solda boşluk yok
        content.style.width = '100%'; // Tam genişlik
      }
    }
  }, [menuOpen]);

  return (
    <>
      <div className={`menu-icon`} onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} />
      </div>

      <nav className={`menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
        <ul>
          <li
            className="side-link"
            onClick={() => {
              setSelectedComponent('Foods');
            }}
          >
            Products
          </li>
          <li
            className="side-link"
            onClick={() => {
              setSelectedComponent('Sort');
            }}
          >
            Sort
          </li>
          <li
            className="side-link"
            onClick={() => {
              setSelectedComponent('Menus');
            }}
          >
            Menus
          </li>
          <li
            className="side-link"
            onClick={() => {
              setSelectedComponent('Categories');
            }}
          >
            Categories
          </li>
          <li
            className="side-link"
            onClick={() => {
              setSelectedComponent('Price Changing');
            }}
          >
            Price Changing
          </li>
          <li
            className="side-link"
            onClick={() => {
              setSelectedComponent('Home Page');
            }}
          >
            Home Page
          </li>
        </ul>
      </nav>

      <div className={`overlay ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}></div>
    </>
  );
}

export default Menu;
