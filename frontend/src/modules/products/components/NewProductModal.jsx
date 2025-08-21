import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import CategoryModal from '../../categories/components/NewCategoryModal';
import '../../../css/productModal.css';
const API_URL = import.meta.env.VITE_API_URL;
const ProductModal = ({ show, handleClose, handleSave }) => {
  const [file, setFile] = useState(null); // Dosyayı saklamak için state
  const [fileName, setFileName] = useState('Dosya Seçilmedi'); // Başlangıçta "Dosya Seçilmedi" metni
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category_id, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  
  

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/categories`);
      if (!response.ok) {
        throw new Error('Kategorileri çekmede bir hata oluştu');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Kategoriler alınamadı', error);
    }
  };

  const handleSubmit = async (e) => {
    // Yeni ürünü veri tabanına ekle
    e.preventDefault();

    const formData = new FormData();
    formData.append('productName',productName);
    formData.append('description',description),
    formData.append('price',price);
    formData.append('category_id',category_id);
    formData.append('resim',file);
    
    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/create`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Yeni ürün eklendikten sonra formu temizleyin
      setProductName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setFile(null);
      setFileName('Dosya Seçilmedi');
      handleSave();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const fetchLastCategory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/categories/last`);
      if (!response.ok) {
        throw new Error('Kategorileri çekmede bir hata oluştu');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Kategoriler alınamadı', error);
    }
  }

  // const filterMainCategories = (categories) => {
  //   return categories.filter(category => category.parent_id !== null);
  // }


  const handleSaveforPlus = async () => {
  // Yeni kategori eklendikten sonra kategorileri yeniden fetch et
 
    fetchCategories();
    const lastCategory = await fetchLastCategory();
    setCategoryId(lastCategory.category_id);
    setShowCategoryModal(false);
  
  };

  const handleModalClose = () => {
    setProductName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    handleClose();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
    if (file) {
      setFileName(file.name); // Seçilen dosyanın ismini göster
    } else {
      setFileName('Dosya Seçilmedi');
    }
  };
  return (
    <div className={`modal ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content" >
          <div className="modal-header">
            <h5 className="modal-title">Yeni Ürün Ekle</h5>
            <button type="button" className="btn-close" onClick={handleModalClose} ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} enctype="multipart/form-data">
              <div className="mb-3">
                <label htmlFor="productName" className="form-label">Ürün Adı</label>
                <input
                  type="text"
                  className="form-control"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Açıklama</label>
                <input
                style={{
                  textAlign: "left",
                  verticalAlign: "top",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "break-word",
                }}
                  type="text"
                  className="form-control"
                  id="description"
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
              <div className="mb-3">
                <label htmlFor="category" className="form-label">Kategori</label>
                <div   style={{ display: 'flex', alignItems: 'center' } }>
                  <select
                    className="form-control category-selector"
                    id="category"
                    value={category_id}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  >
                    <option value="" >Kategori Seçin</option>
                  
                    
                    {(categories).map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                  <button type="button" className='btn btn-outline-primary' onClick={() => setShowCategoryModal(true)}>
                  <FontAwesomeIcon
                    icon={faPlus}
                    className='plus-icon'
                    style={{ marginLeft: '10px', cursor: 'pointer' }}
                    
                  />
                  </button>
                  
                </div>
                <div className='row mb-3' style={{width: '510px' ,height: '150px' , marginTop: '5px' ,marginLeft: '2px'}}>
                  <label className='col-sm-3 col-form-label' style={{marginBottom: '0px'}}>Resim</label>
                  <div className='col-sm-10' style={{display: 'flex', alignItems: 'center' ,marginTop: '-40px' ,border: '2px solid #ccc', padding: '10px', borderRadius: '5px'}}>
                    <div className="custom-file">
                      <input
                        type="file"
                        className="custom-file-input"
                        id="resim"
                        name="resim"
                        onChange={handleFileChange}
                        style={{ display: 'none' }} // Dosya yükleme inputunu gizle
                      />
                        <label htmlFor="resim" className="btn btn-primary"style={{ marginRight: '50px' }}>
                          Dosya Seç
                        </label>
                        <span className="ml-2">{fileName}</span> {/* Seçilen dosyanın adını göster */}
                      </div>
                    </div>
                  </div>
                </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" style={{ width: '70%', marginBottom: '100px'}}>Kaydet</button>
              </div>
                  
            </form>
          </div>
        </div>
      </div>
      <CategoryModal
        show={showCategoryModal}
        handleClose={() => setShowCategoryModal(false)}
        handleSave={handleSaveforPlus}
      />
    </div>
  );
};

export default ProductModal;
