import React, { useState, useEffect } from 'react';
import '../css/FoodMenus.css';
import MenuModal from './MenuCreateModal';
import AddProductModal from './AddProductToMenuModal';



const Menus = () => {


  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showAddProductToMenuModal, setShowAddProductToMenuModal] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null);

  useEffect(() => {
    fetchMenus();
  }, []);



  const handleOpenModal = (menuId) => {
    setSelectedMenuId(menuId);
    setShowAddProductToMenuModal(true);
};

const handleCloseModal = () => {
    setShowAddProductToMenuModal(false);
    setSelectedMenuId(null);
};

  const fetchMenus = async () => {
    try { 
      const response = await fetch('http://localhost:5000/api/admin/menus', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setRows(data);
    } catch (error) {
      setError(error.message);
    }
  };


  const handleSave = () =>{
    fetchMenus();
    setShowMenuModal(false);
  }


  return (
    
   <>
   <button className="btn btn-primary"
   onClick={() => setShowMenuModal(true)}
   >Yeni Menü Ekle</button>

    <MenuModal show={showMenuModal} className="menu_modal" handleClose={() => setShowMenuModal(false)} handleSave={handleSave} />

    <h1>Menüler</h1>
    <div className="table-container">
      <table className="table" style={{ borderRadius: '15px' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>isActive</th>
            <th>Actions</th>
            
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.menu_id}>
              <td>{row.name}</td>
              <td>{row.description}</td>
              <td>{row.price}</td>
              {row.isActive ? <td>false</td> : <td>true</td>}
              <td> 
                <button
                  className="btn btn-primary"
                  onClick={() => setShowMenuModal(true)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                 
                >
                  Delete
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleOpenModal(row.menu_id)}
                  >
                    Add Product
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table> 
    </div>
    <AddProductModal
                open={showAddProductToMenuModal}
                selectedMenuId = {selectedMenuId}
                menus = {rows}
                handleClose={handleCloseModal}
            />
   </>  
   
  );
};

export default Menus;
