import React, { useState ,useEffect} from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const SubCategoryModal = ({ show, handleClose, handleSave ,parentId }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [other_sub_categories,setOther_sub_categories] = useState([]);




  useEffect(()=>{
    fetchOtherSubCategories();
  },[]);


  const fetchOtherSubCategories = async (e) => {
    e.preventDefault();
    try{
        const response = await fetch(
            `${API_URL}/api/admin/categories/subs/${parentId}` ,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ parentId }),
            }
        );
        const data = response.json();
        setOther_sub_categories(data);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
    }catch(error){
        console.error('Error fetching sub-categories:', error);
        setError('Error fetching sub-categories');
    }
  };






  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_URL}/api/admin/categories/create-sub`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name , parentId}),
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
            <h5 className="modal-title">Alt Kategori Ekle</h5>
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

export default SubCategoryModal;
