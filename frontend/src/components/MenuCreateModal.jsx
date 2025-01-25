import React , { useEffect, useState } from 'react';
import '../menuModal.css'
const MenuCreateModal = ({ show, handleClose, handleSave }) =>{
    const [menuName, setMenuName] = useState('');
    const [error,setError] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    // const [is_active, setIsActive] = useState(false);


    const handleSubmit = async(e) => {
      e.preventDefault();
      try {
        const response = await fetch('http://localhost:5000/api/admin/menus/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ menuName, description, price }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        setError('');
        setMenuName('');
        setDescription('');
        setPrice('');
        handleSave();
      
      } catch (error) {
        console.error('Error adding menu:', error);
        setError('Error adding menu');
      }
    };
    const handleModalClose = () => {
      setMenuName('');
      setDescription('');
      setPrice('');
      handleClose();
    };


    return (
        <div className={`modal ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1">
        <div className="menu-modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="menu-modal-title">Yeni Menü Ekle</h5>
              <button type="button" className="btn-close" onClick={handleModalClose}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="menuName" className="form-label">Menü Adı</label>
                  <input
                  
                    type="text"
                    className="form-control"
                    id="Name"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    required
                  />
                </div>
                <div className='mb-3'>
                  <label htmlFor="description" className="form-label">Acıklama</label>
                  <input
                   
                    type="text"
                    className="form-control"
                    id="menu-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Fiyat</label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />

                </div>
                {error && <div className="text-danger">{error}</div>}
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary" style={{ width: '70%', display: 'block', margin: 'auto' }}>Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
        
    );
};

export default MenuCreateModal;


