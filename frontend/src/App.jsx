// src/App.jsx
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './components/Menu';
import Content from './components/Content';
import Login from './components/Login';
import './css/App.css';
import './css/content.css';

function App() {
  const [selectedComponent, setSelectedComponent] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgisini al
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App responsive-container">
        <div className="menu-container">
          <Menu setSelectedComponent={setSelectedComponent} onLogout={handleLogout} />
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
            <Route path="/auth" element={<Content selectedComponent="Auth" />} />
            
            {/* Profil */}
            <Route path="/profile" element={<Content selectedComponent="Profile" />} />
            
            {/* Çıkış Yap */}
            <Route path="/logout" element={<Content selectedComponent="Logout" />} />
            
            {/* 404 - Bilinmeyen route'lar için */}
            <Route path="*" element={<div>Sayfa bulunamadı!</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
