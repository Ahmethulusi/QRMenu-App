// src/App.jsx
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Menu from './components/Menu';
import Content from './components/Content';
import Login from './components/Login';
import { authAPI } from './utils/api';
import './css/App.css';
import './css/content.css';

function App() {
  const [selectedComponent, setSelectedComponent] = useState('Foods'); // Varsayılan olarak Foods
  const [user, setUser] = useState(null);

  // Token geçerliliğini kontrol eden fonksiyon
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      return;
    }

    try {
      // Token'ın geçerliliğini backend'den kontrol et
      const userData = await authAPI.getCurrentUser();
      
      // Backend'den gelen kullanıcı bilgilerini kullan
      setUser(userData);
    } catch (error) {
      console.log('Token doğrulama hatası:', error.message);
      // Token geçersiz, localStorage'ı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Giriş yapıldığında selectedComponent'i sıfırla
    setSelectedComponent('Foods');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Çıkış yapıldığında selectedComponent'i sıfırla
    setSelectedComponent('Foods');
  };

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
            <Route path="/products" element={<Content selectedComponent={selectedComponent} />} />
            <Route path="/products/sort" element={<Content selectedComponent={selectedComponent} />} />
            
            {/* Kategori Yönetimi */}
            <Route path="/categories" element={<Content selectedComponent={selectedComponent} />} />
            
            {/* Şube Yönetimi */}
            <Route path="/branches" element={<Content selectedComponent={selectedComponent} />} />
            
            {/* QR Yönetimi */}
            <Route path="/qr/general" element={<Content selectedComponent={selectedComponent} />} />
            <Route path="/qr/designs" element={<Content selectedComponent={selectedComponent} />} />
            
            {/* Fiyat Değişikliği */}
            <Route path="/price-change" element={<Content selectedComponent={selectedComponent} />} />
            
            {/* Kullanıcı Yönetimi */}
            <Route path="/users" element={<Content selectedComponent={selectedComponent} />} />
            <Route path="/auth" element={<Content selectedComponent={selectedComponent} />} />
            
            {/* Profil */}
            <Route path="/profile" element={<Content selectedComponent={selectedComponent} />} />
            
            {/* Çıkış Yap */}
            <Route path="/logout" element={<Content selectedComponent={selectedComponent} />} />
            
            {/* 404 - Bilinmeyen route'lar için */}
            <Route path="*" element={<div>Sayfa bulunamadı!</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;