import React from 'react';
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

function Content({ selectedComponent }) {
  switch (selectedComponent) {
    case 'Form':
      return <Form />;

    case 'Products':
      return <ProductTable />;

    case 'Categories':
      return <Categories />;

    case 'Menus':
      return <Menus />;

    case 'Price Changing':
      return <PriceChangingPage />;

    case 'Sort':
      return <Sort2 />;

    case 'Profile':
      return <ProfileScreen />;
    case 'TablesAndQR':
      return <TablesPage />;

    case 'CategorySort':
      return <CategorySortTable />;

    case 'GeneralQR':
      return <NonOrderableQR />;

    case 'Branches':
      return <BranchProductMatrix businessId={1} />;
    
    case 'Users':
      return <UsersTable businessId={1} />;
      
    case 'Roles':
      return <UsersTable businessId={1} />;
      
    case 'QRDesigns':
      return <QRDesignsTable businessId={1} />;
    
    case 'Auth':
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