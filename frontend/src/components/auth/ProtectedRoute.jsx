import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, canAccess } from '../utils/permissions';
import NoPermission from './NoPermission';

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
      // Yetkisi yoksa yetkisiz erişim sayfasını göster
      return <NoPermission />;
    }
  }

  return children;
};

export default ProtectedRoute; 