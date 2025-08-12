import React, { useState, useEffect } from 'react';
import Sort2 from '../components/Sort2';
import Menus from '../components/FoodMenus';
// import Categories from '../components/Categories';
import Categories from '../components/Additional_Category_Table';
// import ProductTable from '../components/ProductTable';
import ProductTable from './Product_Table';
import PriceChangingPage from '../components/PriceChange';
// import EditableTable from '../components/EditableTable';
import HomePage from '../components/HomePage';
import ProfileScreen from '../components/ProfileScreen';
import CategorySortTable from '../components/CategorySort';
import TablesPage from '../components/TablesPage';
import NonOrderableQR from '../components/Non_OrderableQR';
import QRDesignsTable from '../components/QRDesignsTable';
import BranchTable from '../components/BranchTable';
import BranchProductMatrix from '../components/BranchProductMatrix';
import UsersTable from '../components/UsersTable';
import PermissionsTable from '../components/PermissionsTable';
import { getCurrentUser } from '../utils/permissions';

function Content({ selectedComponent }) {
  const user = getCurrentUser();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  // Component yüklendiğinde yetkileri getir
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/permissions/user`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions || []);
        }
      } catch (error) {
        console.error('Yetki getirme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Component bazlı yetki kontrolü - dinamik yetkilerle
  const checkComponentPermission = (requiredResource, requiredAction) => {
    if (!permissions || !Array.isArray(permissions)) return false;
    return permissions.some(perm => 
      perm.resource === requiredResource && perm.action === requiredAction
    );
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  switch (selectedComponent) {
    case 'Form':
      return <Form />;

    case 'Products':
      if (!checkComponentPermission('products', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <ProductTable />;

    case 'Categories':
      if (!checkComponentPermission('categories', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <Categories />;

    case 'Menus':
      if (!checkComponentPermission('products', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <Menus />;

    case 'Price Changing':
      if (!checkComponentPermission('products', 'update')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <PriceChangingPage />;

    case 'Sort':
      if (!checkComponentPermission('products', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <Sort2 />;

    case 'Profile':
      return <ProfileScreen />;

    case 'TablesAndQR':
      if (!checkComponentPermission('tables', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <TablesPage />;

    case 'CategorySort':
      if (!checkComponentPermission('categories', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <CategorySortTable />;

    case 'GeneralQR':
      if (!checkComponentPermission('qr', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <NonOrderableQR />;

    case 'Branches':
      if (!checkComponentPermission('branches', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <BranchProductMatrix businessId={1} />;
    
    case 'Users':
      if (!checkComponentPermission('users', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <UsersTable businessId={1} />;
      
    case 'Roles':
      if (!checkComponentPermission('users', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <UsersTable businessId={1} />;
      
    case 'QRDesigns':
      if (!checkComponentPermission('qr', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <QRDesignsTable businessId={1} />;
    
    case 'Auth':
      if (!checkComponentPermission('users', 'read')) {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
      }
      return <PermissionsTable businessId={1} />;
    
    case 'Logout':
      // Çıkış işlemi Menu.jsx'te handleClick'te yapılıyor
      // Bu case'e gerek yok ama yine de ekleyelim
      return <div>Çıkış yapılıyor...</div>;
    
    default:
      return <div>Menüden bir seçenek seçiniz.</div>;
  }
}

export default Content;