import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, canAccess } from '../utils/permissions';

const ProtectedRoute = ({ children, requiredResource, requiredAction }) => {
  const user = getCurrentUser();

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Yetki kontrolü
  if (requiredResource && requiredAction) {
    const hasPermission = canAccess(user, requiredResource, requiredAction);
    
    if (!hasPermission) {
      // Yetkisi yoksa ana sayfaya yönlendir
      return <Navigate to="/products" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 