import React, { useState, useEffect } from 'react';
import Sort2 from '../../products/components/Sort2';
import Categories from '../../categories/components/Categories';
import ProductTable from '../../products/components/Product_Table';
import PriceChangingPage from '../../products/components/PriceChange';
// import ProfileScreen from '../../users_and_permissions/components/ProfileScreen';
import CategorySortTable from '../../categories/components/CategorySort';
import TablesPage from '../../tables_and_QR/components/TablesPage';
import NonOrderableQR from '../../tables_and_QR/components/Non_OrderableQR';
import QRDesignsTable from '../../tables_and_QR/components/QRDesignsTable';
import SectionManagement from '../../tables_and_QR/components/SectionManagement';
import TableQRManagement from '../../tables_and_QR/components/TableQRManagement';
import BranchProductMatrix from '../../branches/components/BranchProductMatrix';
import UsersTable from '../../users_and_permissions/components/UsersTable';
import PermissionsTable from '../../users_and_permissions/components/PermissionsTable';
import LabelTable from '../../contents/components/LabelTable';
import Announcements from '../../announcements/components/Announcements';
import NoPermission from '../../users_and_permissions/components/NoPermission';
import Settings from './Settings';
import LanguageSettings from '../../languages/components/LanguageSettings';
import ERPTest from '../../ERPTest/ERPTest';
import ERPIntegration from '../../ERPIntegration/ERPIntegration';
import ERP from '../../ERP/ERP';
import Currencies from '../../currencies/components/Currencies';
import DesignSettings from './DesignSettings';
import BusinessProfile from '../../business/components/BusinessProfile';
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
          localStorage.removeItem('user');
          setLoading(false);
          window.location.href = '#/login';
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
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '16px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Yetkiler kontrol ediliyor...
        </div>
      </div>
    );
  }

  switch (selectedComponent) {
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

    case 'BusinessProfile':
      if (!checkComponentPermission('business_profile', 'read')) {
        return <NoPermission 
          title="İşletme profili sayfasına erişim yetkiniz yok"
          subTitle="İşletme profilini düzenlemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <BusinessProfile />;

    case 'GeneralSettings':
      return <Settings />;

    case 'LanguageSettings':
      if (!checkComponentPermission('languages', 'read')) {
        return <NoPermission 
          title="Dil ayarları sayfasına erişim yetkiniz yok"
          subTitle="Dil ayarlarını yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <LanguageSettings />;

    case 'Currencies':
      if (!checkComponentPermission('currencies', 'read')) {
        return <NoPermission 
          title="Para birimleri sayfasına erişim yetkiniz yok"
          subTitle="Para birimlerini yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <Currencies />;

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
      return <BranchProductMatrix businessId={user?.business_id} />;
    
    case 'Users':
      if (!checkComponentPermission('users', 'read')) {
        return <NoPermission 
          title="Kullanıcılar sayfasına erişim yetkiniz yok"
          subTitle="Kullanıcıları yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <UsersTable businessId={user?.business_id} />;
      
    case 'Roles':
      if (!checkComponentPermission('users', 'read')) {
        return <NoPermission 
          title="Roller sayfasına erişim yetkiniz yok"
          subTitle="Kullanıcı rollerini yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <UsersTable businessId={user?.business_id} />;
      
    case 'QRDesigns':
      if (!checkComponentPermission('qrcodes', 'read')) {
        return <NoPermission 
          title="QR Tasarımları sayfasına erişim yetkiniz yok"
          subTitle="QR tasarımlarını görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <QRDesignsTable businessId={user?.business_id} />;
      
    case 'TableSections':
      if (!checkComponentPermission('tables', 'read')) {
        return <NoPermission 
          title="Bölümler sayfasına erişim yetkiniz yok"
          subTitle="Bölümleri görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <SectionManagement />;
      
    case 'Tables':
      if (!checkComponentPermission('tables', 'read')) {
        return <NoPermission 
          title="Masalar sayfasına erişim yetkiniz yok"
          subTitle="Masaları görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <TableQRManagement />;
      
    case 'DesignSettings':
      if (!checkComponentPermission('qrcodes', 'read')) {
        return <NoPermission 
          title="QR Tasarım Ayarları sayfasına erişim yetkiniz yok"
          subTitle="QR tasarım ayarlarını görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <DesignSettings />;
    
    case 'ERP':
      if (!checkComponentPermission('erp', 'read')) {
        return <NoPermission 
          title="ERP sayfasına erişim yetkiniz yok"
          subTitle="ERP entegrasyonunu görüntülemek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <ERP />;
    case 'ERPTest':
      if (!checkComponentPermission('erp', 'read')) {
        return <NoPermission 
          title="ERP Test sayfasına erişim yetkiniz yok"
          subTitle="ERP test işlemlerini yapmak için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <ERPTest />;
    case 'ERPIntegration':
      if (!checkComponentPermission('erp', 'read')) {
        return <NoPermission 
          title="ERP Entegrasyon sayfasına erişim yetkiniz yok"
          subTitle="ERP entegrasyonunu yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <ERPIntegration />;
    
    case 'Auth':
      if (!checkComponentPermission('permissions', 'read')) {
        return <NoPermission 
          title="Yetkilendirmeler sayfasına erişim yetkiniz yok"
          subTitle="Kullanıcı yetkilerini yönetmek için gerekli yetkilere sahip değilsiniz."
        />;
      }
      return <PermissionsTable businessId={user?.business_id} />;
    
    case 'Logout':
      // Çıkış işlemi Menu.jsx'te handleClick'te yapılıyor
      // Bu case'e gerek yok ama yine de ekleyelim
      return <div>Çıkış yapılıyor...</div>;
    
    default:
      return <div>Menüden bir seçenek seçiniz.</div>;
  }
}

export default Content;