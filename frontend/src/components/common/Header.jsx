import React from 'react';
// import Navs from './Nav';
import '../css/navbar.css';
import Profile from './ProfileScreen';
const Header = () => {


  return (
    <header className='header' style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px',height: '80px'}}>
    
    <a className='logo' style={{color: 'white', fontSize: '24px', fontWeight: 'bold'}}>Admin Panel</a>    
    <Profile/>

    </header>
  );
};

export default Header;


