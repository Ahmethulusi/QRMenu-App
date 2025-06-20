
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

function Content({ selectedComponent }) {
  if (selectedComponent === 'Form') {
    return <Form />;
  }
  
  else if (selectedComponent === 'Foods') {
    return <ProductTable/>;
  }
  
  else if (selectedComponent === 'Categories') {
    return <Categories />;
  }
  
  else if (selectedComponent === 'Menus') {
    return <Menus/>;
  }
  
  else if (selectedComponent === 'Price Changing') {
    return <PriceChangingPage/>;
  }
  
  else if (selectedComponent === 'Sort') {
    return <Sort2/>;
  }
  
  // else if (selectedComponent === 'Home Page') {
  //   return <HomePage/>;
  // }
  else {
    return <div>Select an option from the menu</div>;
  }
}

export default Content;