import React, { useState } from 'react';

const CategoryModal = ({ show, handleClose, handleSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        'http://localhost:5000/api/admin/categories/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setError('');
      setName(''); 
      handleSave();  // Veritabanına kaydettikten sonra tabloyu güncellemek için
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Error adding category');
    }
  };

  return (
    <div className={`modal ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Yeni Kategori Ekle</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="categoryName" className="form-label">Kategori Adı</label>
                <input
                  type="text"
                  className="form-control"
                  id="categoryName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

export default CategoryModal;
