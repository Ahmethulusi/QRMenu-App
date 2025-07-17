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
import TablesPage from '../components/TablesPage';
import NonOrderableQR from '../components/Non_OrderableQR';
import QRDesignsTable from '../components/QRDesignsTable';
import BranchTable from '../components/BranchTable';

function Content({ selectedComponent }) {
  switch (selectedComponent) {
    case 'Form':
      return <Form />;

    case 'Foods':
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
    
    case 'GeneralQR':
      return <NonOrderableQR />;

    case 'Branches':
      return <BranchTable />;
    
    case 'QRDesigns':
      return <QRDesignsTable businessId={1} />;
    
    default:
      return <div>Menüden bir seçenek seçiniz.</div>;
  }
}

export default Content;