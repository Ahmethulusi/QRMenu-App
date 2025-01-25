import React, { useState, useEffect } from 'react';
import '../css/categories.css';
import CategoryModal from './NewCategoryModal';
import SubCategoryModal from './NewSubCategory';
// import { color, margin, width } from '@mui/system';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSubCatModal, setSubCatShowModal] = useState(false);
  const [parentId, setParentId] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);
  
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try { 
      const response = await fetch('http://localhost:5000/api/admin/categories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleOpenModal = (parentId) => {
    setParentId(parentId);
    setSubCatShowModal(true);
  }
  
  const handleSave = () =>{
    fetchCategories();
    setShowModal(false);
    setSubCatShowModal(false);
  }

  const toggleCategory = (categoryId) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };
  const renderCategories = (categories, parentId = null, level = 0) => {
    const hasChildren = (categoryId) => {
      return categories.some(category => category.parent_id === categoryId);
    };
  
    return categories
      .filter(category => category.parent_id === parentId)
      .map(category => {
        const categoryHasChildren = hasChildren(category.category_id);
  
        return (
          <React.Fragment key={category.category_id}>
            <tr className="no-hover">
              <td 
                style={{ 
                  paddingLeft: `${level * 150}px`, 
                  width: '50%', 
                  color: 'black',
                  position: 'relative',
                }}
              >
                {categoryHasChildren && (
                  <span 
                    onClick={() => toggleCategory(category.category_id)} 
                    style={{ 
                      
                      cursor: 'pointer', 
                      marginRight: '10px', 
                      fontSize: '20px', 
                      color: 'blue', 
                      display: 'inline-block',
                      transition: 'transform 0.3s ease',
                      transform: expandedCategories.includes(category.category_id) ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                    {expandedCategories.includes(category.category_id) ? '-' : '+'}
                  </span>
                )}
                {category.category_name}
              </td>
              
              {/* Butonlar için flex düzeni ekleyin */}
              <td className="actions-column">
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  Düzenle
                </button>
                <button className="btn btn-danger">
                  Sil
                </button>
                <button className="btn btn-success" onClick={() => handleOpenModal(category.category_id)}>
                  Alt Kategori Ekle
                </button>
              </td>
            </tr>
  
            {expandedCategories.includes(category.category_id) && (
              <tr className="no-hover">
                <td colSpan="2" style={{ padding: 0 }}>
                  <div
                    className="expanding-div no-hover"
                    style={{
                      backgroundColor: '#f0f0f0',
                      paddingLeft: `${(level + 1) * 90}px`,
                      paddingTop: '10px',
                      paddingBottom: '10px',
                    }}
                  >
                    {renderCategories(categories, category.category_id, level + 1)}
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      });
  };
  
  return (
    <>
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        Yeni Kategori Ekle
      </button>

      <CategoryModal show={showModal} className="category_modal" handleClose={() => setShowModal(false)} handleSave={handleSave} />
      <SubCategoryModal show={showSubCatModal} className="sub-category_modal" handleClose={() => setSubCatShowModal(false)} handleSave={handleSave} parentId={parentId} />

      <h1>Kategoriler</h1>
      <div className="table-container" style={{ width: '100%' }}>
        <table className="table" style={{ borderRadius: '15px' }}>
          <thead>
            <tr>
              
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderCategories(categories)}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Categories;
