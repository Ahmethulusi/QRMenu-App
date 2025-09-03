// src/App.jsx
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Menu from './modules/common/components/Menu';
import Content from './modules/common/components/Content';
import Login from './modules/auth/components/Login';
import ProtectedRoute from './modules/common/components/ProtectedRoute';
import { authAPI } from './modules/common/utils/api';
import { LanguageProvider } from './contexts/LanguageContext';
import './modules/common/css/App.css';
import './modules/common/css/content.css';

function AppContent() {
  const [selectedComponent, setSelectedComponent] = useState(() => {
    // localStorage'dan selectedComponent'i al, yoksa 'Products' kullan
    return localStorage.getItem('selectedComponent') || 'Products';
  });
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // Yeni state
  const navigate = useNavigate();

  // selectedComponent değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('selectedComponent', selectedComponent);
  }, [selectedComponent]);

  // Token geçerliliğini kontrol eden fonksiyon
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      setIsInitializing(false);
      return;
    }

    // Token geçerliliğini backend'den kontrol et (loading sırasında admin paneli gösterme)
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setIsInitializing(false);
    } catch (error) {
      console.log('Token doğrulama hatası:', error.message);
      // Token geçersiz, localStorage'ı temizle ve /login'e yönlendir
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsInitializing(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Login yapıldığında selectedComponent'i Products olarak ayarla ve ana sayfaya yönlendir
    setSelectedComponent('Products');
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Çıkış yapıldığında selectedComponent'i sıfırla ve /login'e yönlendir
    setSelectedComponent('Foods');
    navigate('/login');
  };

  // İlk yükleme sırasında kısa bir loading göster
  if (isInitializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <Routes>
      {/* Login sayfası */}
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      
      {/* Ana uygulama - kullanıcı girişi gerekli */}
      <Route path="/*" element={
        user ? (
          <div className="App responsive-container">
            <div className="menu-container">
              <Menu setSelectedComponent={setSelectedComponent} onLogout={handleLogout} />
            </div>
            <div className="content">
              <Routes>
                {/* Ana sayfa - varsayılan olarak Products'a yönlendir */}
                <Route path="/" element={
                  <ProtectedRoute requiredResource="products" requiredAction="read">
                    <Content selectedComponent="Products" />
                  </ProtectedRoute>
                } />
                
                {/* Ürün Yönetimi */}
                <Route path="/products" element={
                  <ProtectedRoute requiredResource="products" requiredAction="read">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                <Route path="/products/sort" element={
                  <ProtectedRoute requiredResource="products" requiredAction="read">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                
                {/* Kategori Yönetimi */}
                <Route path="/categories" element={
                  <ProtectedRoute requiredResource="categories" requiredAction="read">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                
                {/* İçerik Yönetimi */}
                <Route path="/labels" element={
                  <ProtectedRoute requiredResource="labels" requiredAction="read">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                <Route path="/announcements" element={
                  <ProtectedRoute requiredResource="announcements" requiredAction="read">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                <Route path="/campaigns" element={
                  <Content selectedComponent={selectedComponent} />
                } />
                <Route path="/daily-menu" element={
                  <Content selectedComponent={selectedComponent} />
                } />
                <Route path="/ingredients" element={
                  <Content selectedComponent={selectedComponent} />
                } />
                
                {/* Şube Yönetimi */}
                <Route path="/branches" element={
                  <ProtectedRoute requiredResource="branches" requiredAction="read">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                
                {/* QR Yönetimi */}
                <Route path="/qr/general" element={
                  <ProtectedRoute requiredResource="qr" requiredAction="read">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                <Route path="/qr/designs" element={
                  <ProtectedRoute requiredResource="qr" requiredAction="read">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                
                {/* Fiyat Değişikliği */}
                <Route path="/price-change" element={
                  <ProtectedRoute requiredResource="products" requiredAction="update">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                
                {/* Kullanıcı Yönetimi */}
                <Route path="/users" element={
                  <ProtectedRoute requiredResource="users" requiredAction="read">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                <Route path="/auth" element={
                  <ProtectedRoute requiredResource="users" requiredAction="read">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                
                {/* Profil */}
                <Route path="/profile" element={<Content selectedComponent={selectedComponent} />} />
                
                {/* Genel Ayarlar */}
                <Route path="/settings" element={<Content selectedComponent={selectedComponent} />} />
                
                {/* Dil Ayarları */}
                <Route path="/language-settings" element={
                  <ProtectedRoute requiredResource="system" requiredAction="settings">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                
                {/* Para Birimleri */}
                <Route path="/currencies" element={
                  <ProtectedRoute requiredResource="system" requiredAction="settings">
                    <Content selectedComponent={selectedComponent} />
                  </ProtectedRoute>
                } />
                
                {/* ERP Modülü */}
                <Route path="/erp" element={<Content selectedComponent="ERP" />} />
                <Route path="/erp/test" element={<Content selectedComponent="ERPTest" />} />
                <Route path="/erp/integration" element={<Content selectedComponent="ERPIntegration" />} />
                
                {/* Çıkış Yap */}
                <Route path="/logout" element={<Content selectedComponent={selectedComponent} />} />
                
                {/* 404 - Bilinmeyen route'lar için */}
                <Route path="*" element={<div>Sayfa bulunamadı!</div>} />
              </Routes>
            </div>
          </div>
        ) : (
          <Navigate to="/login" replace />
        )
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </Router>
  );
}

export default App;