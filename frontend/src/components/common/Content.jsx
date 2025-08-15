import React, { useState, useEffect } from 'react';
import Sort2 from '../components/Sort2';
import Menus from '../components/FoodMenus';
// import Categories from '../components/Categories';
import Categories from '../components/Categories';
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
import LabelTable from '../components/LabelTable';
import Announcements from '../components/Announcements';
import NoPermission from '../components/NoPermission';
import { getCurrentUser } from '../utils/permissions';

function Content({ selectedComponent }) {
  const user = getCurrentUser();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  // Component yüklendiğinde yetkileri getir
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/permissions/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          // Token geçersiz, kullanıcıyı login'e yönlendir
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        
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
    // Super admin her şeyi yapabilir
    if (user && user.role === 'super_admin') return true;
    
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
        return <NoPermission 
          title="Ürünler sayfasına erişim yetkiniz yok"
          subTitle="Ürünleri görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <ProductTable />;

    case 'Categories':
      if (!checkComponentPermission('categories', 'read')) {
        return <NoPermission 
          title="Kategoriler sayfasına erişim yetkiniz yok"
          subTitle="Kategorileri görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <Categories />;

    case 'Labels':
      if (!checkComponentPermission('labels', 'read')) {
        return <NoPermission 
          title="Etiketler sayfasına erişim yetkiniz yok"
          subTitle="Etiketleri görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <LabelTable />;

    case 'Announcements':
      if (!checkComponentPermission('announcements', 'read')) {
        return <NoPermission 
          title="Duyurular sayfasına erişim yetkiniz yok"
          subTitle="Duyuruları görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <Announcements />;

    case 'Campaigns':
      return <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Kampanyalar</h2>
        <p>Bu özellik henüz geliştirilmemiştir.</p>
      </div>;

    case 'DailyMenu':
      return <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Günün Menüsü</h2>
        <p>Bu özellik henüz geliştirilmemiştir.</p>
      </div>;

    case 'Ingredients':
      return <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>İçindekiler</h2>
        <p>Bu özellik henüz geliştirilmemiştir.</p>
      </div>;

    case 'Menus':
      if (!checkComponentPermission('products', 'read')) {
        return <NoPermission 
          title="Menüler sayfasına erişim yetkiniz yok"
          subTitle="Menüleri görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <Menus />;

    case 'Price Changing':
      if (!checkComponentPermission('products', 'update')) {
        return <NoPermission 
          title="Fiyat değişikliği sayfasına erişim yetkiniz yok"
          subTitle="Ürün fiyatlarını değiştirmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <PriceChangingPage />;

    case 'Sort':
      if (!checkComponentPermission('products', 'sort')) {
        return <NoPermission 
          title="Sıralama sayfasına erişim yetkiniz yok"
          subTitle="Ürün sıralamasını değiştirmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <Sort2 />;

    case 'Profile':
      return <ProfileScreen />;

    case 'TablesAndQR':
      if (!checkComponentPermission('tables', 'read')) {
        return <NoPermission 
          title="Masa ve QR sayfasına erişim yetkiniz yok"
          subTitle="Masaları ve QR kodlarını yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <TablesPage />;

    case 'CategorySort':
      if (!checkComponentPermission('categories', 'sort')) {
        return <NoPermission 
          title="Kategori sıralama sayfasına erişim yetkiniz yok"
          subTitle="Kategori sıralamasını değiştirmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <CategorySortTable />;

    case 'GeneralQR':
      if (!checkComponentPermission('qrcodes', 'read')) {
        return <NoPermission 
          title="Genel QR sayfasına erişim yetkiniz yok"
          subTitle="Genel QR kodları oluşturmak için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <NonOrderableQR />;

    case 'Branches':
      if (!checkComponentPermission('branches', 'read')) {
        return <NoPermission 
          title="Şubeler sayfasına erişim yetkiniz yok"
          subTitle="Şubeleri yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <BranchProductMatrix businessId={1} />;
    
    case 'Users':
      if (!checkComponentPermission('users', 'read')) {
        return <NoPermission 
          title="Kullanıcılar sayfasına erişim yetkiniz yok"
          subTitle="Kullanıcıları yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <UsersTable businessId={1} />;
      
    case 'Roles':
      if (!checkComponentPermission('users', 'read')) {
        return <NoPermission 
          title="Roller sayfasına erişim yetkiniz yok"
          subTitle="Kullanıcı rollerini yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <UsersTable businessId={1} />;
      
    case 'QRDesigns':
      if (!checkComponentPermission('qrcodes', 'read')) {
        return <NoPermission 
          title="QR Tasarımları sayfasına erişim yetkiniz yok"
          subTitle="QR tasarımlarını görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <QRDesignsTable businessId={1} />;
    
    case 'Auth':
      if (!checkComponentPermission('permissions', 'read')) {
        return <NoPermission 
          title="Yetkilendirmeler sayfasına erişim yetkiniz yok"
          subTitle="Kullanıcı yetkilerini yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
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