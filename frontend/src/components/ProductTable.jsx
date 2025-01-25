import React, { useState, useEffect, createContext ,useMemo} from 'react';
import '../css/table2.css';
import ProductModal from './NewProductModal';
import CategoryModal from './NewCategoryModal';
import EditModal from './EditModal';
// import Select from 'react-select';
import { Select,Input } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';

export const ProductContext = createContext();


const Table = () => {
  const [rows, setRows] = useState([]); // tabloya yazdıracağımız ürün listesi
  const [product, setProduct] = useState(null);// update modalına gidecek tek ürün
  const [error, setError] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [record, setRecord] = useState([])// filtreleme islemi için gerekli değişken
  const [selectedCategory,setSelectedCategory] = useState(null)  
  const items = [
    {
      label: 'Product',
      key: '0',
      onClick:() => setShowProductModal(true),
    },
    {
      label: 'Category',
      key: '1',
      onClick:() => setShowCategoryModal(true),
    },
    {
      type: 'divider',
    },
    
  ];


 // Benzersiz kategorileri tutan fonksiyon
const categories = rows.reduce((acc, row) => {
  // Eğer daha önce bu category_id eklenmediyse listeye ekle
  if (!acc.some(category => category.category_id === row.Category.category_id)) {
    acc.push({
      category_id: row.Category.category_id,
      category_name: row.Category.category_name // Kategori adını buradan alıyoruz
    });
  }
  return acc;
}, []); // Başlangıç boş bir dizi olacak

const categoryOptions = categories.map(category => ({
  value: category.category_id,  // Kategori ID
  label: category.category_name // Kategori Adı
}));

// const handleCategoryChange = (value) => {
//   const selected = categoryOptions.find(option => option.value === value);
//   setSelectedCategory(selected); // Hem id hem name içeren tam objeyi set et
// };

const filterProducts = useMemo(() => {
  if (selectedCategory) {
    return rows.filter(product => product.category_id === selectedCategory.value);
  } else {
    return rows;
  }
}, [selectedCategory, rows]);

useEffect(() => {
  setRecord(filterProducts);
  console.log('Selected Category:', selectedCategory);
  console.log('Filtered Products:', filterProducts);
}, [selectedCategory, filterProducts]);


// Arama filtresi
const Filter = (event) => {
  if (selectedCategory == null) {
    setRecord(
      rows.filter((f) =>
        f.product_name
          .toLocaleLowerCase()
          .includes(event.target.value.toLocaleLowerCase())
      )
    );
  }
};

// Ürünleri ve menüleri fetch etmek için
useEffect(() => {
  fetchProducts();
}, []);

// Kategori seçilmediğinde tüm ürünleri göstermek için
useEffect(() => {
  if (selectedCategory == null) {
    setRecord(rows);
  }
}, [rows]);



  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/products');
      if (!response.ok) {
        throw new Error('Verileri çekmede bir hata oluştu');
      }
      const data = await response.json();
      setRows(data);
    } catch (error) {
      console.error('Bir hata oluştu', error);
      setError('Veriler alınamadı. Lütfen tekrar deneyin.');
    }
  };

  // const fetchMenus = async () => {
  //   try {
  //     const response = await fetch('http://localhost:5000/api/admin/menus');
  //     if (!response.ok) {
  //       throw new Error('Verileri çekmede bir hata oluştu');
  //     }
  //     const data = await response.json();
  //     setMenus(data);
  //   } catch (error) {
  //     console.error('Bir hata oluştu', error);
  //     setError('Veriler alınamadı. Lütfen tekrar deneyin.');
  //   }
  // };

  const handleCheckboxChange = id => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.product_id === id ? { ...row, is_selected: !row.is_selected } : row,
      ),
    );
  };

  // const handleToggleChange = (id) => {
  //   setRows(prevRows =>
  //     prevRows.map(row =>
  //       row.product_id === id ? { ...row, is_available: !row.is_available } : row,
  //     ),
  //   );
  // };

  const handleSave = () => {
    fetchProducts();
    setShowProductModal(false);
    setShowCategoryModal(false);
  };

  const handleEditClick = row => {
    setProduct(row);
    setShowEditModal(true);
  };


 


  return (
    <ProductContext.Provider value={product}>
      <div className="table-container">
        <h1 className='title'>Product Table</h1>
        <div className="btn-group" role="group">
       
            {/* <button
          
              type="button"
              id='ekle-buton'
              className="btn btn-primary dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              + Ekle
            </button>
            <ul className="dropdown-menu">
              <li className="list" onClick={() => setShowProductModal(true)}>
                Ürün
              </li>
              <li className="list" onClick={() => setShowCategoryModal(true)}>
                Kategori
              </li>
            </ul> */}
          <Dropdown
              menu={{
                items,
              }}
              trigger={['click']}
              id='ekle-buton'
              className="dropdown-buton"
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  Ekle
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
                    

          <div className="input-group mb-2">
            <Input
                type="text"
                className="search"
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                placeholder="Search Product..."
                onChange={Filter}
              />
          
            <Select 
              className='select mb-2' 
              allowClear
              options={categoryOptions}
              onChange={value => {
                if (value === undefined) {
                  setSelectedCategory(null); // Seçim temizlenirse null set et
                } else {
                  const selected = categoryOptions.find(option => option.value === value);
                  setSelectedCategory(selected);
                }
              }}
              
              placeholder="Select a Category"
              value={selectedCategory ? selectedCategory.value : undefined} // Seçili değeri gösteriyoruz
            />
          </div>

      </div>


 

        <CategoryModal show={showCategoryModal} handleClose={() => setShowCategoryModal(false) } handleSave={handleSave}/>
        <ProductModal show={showProductModal} handleClose={() => setShowProductModal(false)} handleSave={handleSave} />

        
        <table className="table">
          <thead className="table-column">
            <tr>
              <th style={{ textAlign: 'left' }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="check1"
                  name="option1"
                  value="something"
                />
              </th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
          

          {record.map((row) => (

              //  TABLODAKİ SATIRIN ÜZERİNİ ÇİZEN AŞAĞIDAKİ KOD SATIRI
              <tr key={row.product_id} className={row.is_available ? 'faded disabled' : ''}> 
                <td>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="check1"
                    name="option1"
                    value="something"
                    checked={row.is_selected}
                    onChange={() => handleCheckboxChange(row.product_id)}
                    disabled={row.is_available}
                  />
                </td>
                <td>{row.product_name}</td>
                <td>{row.description}</td>
                <td>{row.price}</td>
                <td>{row.Category ? row.Category.category_name : 'Kategori Yok'}</td>
                <td className="edit">
                  <i class="fa-solid fa-pen-to-square"
                  onClick={() => handleEditClick(row)}></i>



                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showEditModal && <EditModal show={showEditModal} handleClose={() => setShowEditModal(false)} />}

      </div>
    </ProductContext.Provider>
  );
};

export default Table;
