// src/App.jsx
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './components/Menu';
import Content from './components/Content';
// import Header from './components/Header'; 
import './css/App.css';
import './css/content.css';

function App() {
  const [selectedComponent, setSelectedComponent] = useState('');

  return (
    <Router>
      <div className="App responsive-container">
        {/* <Header/> */}
        <div className="menu-container">
          <Menu setSelectedComponent={setSelectedComponent} />
        </div>
        <div className="content">
          <Routes>
            {/* Ana sayfa - varsayılan olarak Foods'a yönlendir */}
            <Route path="/" element={<Navigate to="/products" replace />} />
            
            {/* Ürün Yönetimi */}
            <Route path="/products" element={<Content selectedComponent="Foods" />} />
            <Route path="/products/sort" element={<Content selectedComponent="Sort" />} />
            
            {/* Kategori Yönetimi */}
            <Route path="/categories" element={<Content selectedComponent="Categories" />} />
            
            {/* Şube Yönetimi */}
            <Route path="/branches" element={<Content selectedComponent="Branches" />} />
            
            {/* QR Yönetimi */}
            <Route path="/qr/general" element={<Content selectedComponent="GeneralQR" />} />
            <Route path="/qr/designs" element={<Content selectedComponent="QRDesigns" />} />
            
            {/* Fiyat Değişikliği */}
            <Route path="/price-change" element={<Content selectedComponent="Price Changing" />} />
            
            {/* Kullanıcı Yönetimi */}
            <Route path="/users" element={<Content selectedComponent="Roles" />} />
            
            {/* Profil */}
            <Route path="/profile" element={<Content selectedComponent="Profile" />} />
            
            {/* 404 - Bilinmeyen route'lar için */}
            <Route path="*" element={<div>Sayfa bulunamadı!</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
