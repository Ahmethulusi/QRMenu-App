import React, { useState, useEffect } from 'react';
import { Carousel, Card, Checkbox } from 'antd';
const { Meta } = Card;
// import "../css/CategorySlider.css";

const contentStyle = {
  paddingTop: '20px',
  width: '100%',
  height: '150px',
  color: '#fff',
  lineHeight: '100px',
  textAlign: 'center',
  marginBottom: '30px',
  background: '#364d79',
  borderRadius: '10px',
  fontSize: '20px',
  marginLeft: '20px',
  
};

const App = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [is_available, setIsAvailable] = useState(true); // Varsayılan olarak true, ürünler olup olmadığı kontrol edilecek

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/categories")
      .then((response) => response.json())
      .then((categories) => setCategories(categories))
      .catch((error) => console.error("Veri çekme hatası:", error));
  }, []);

  const handleCategoryClick = async (category_id) => {  
    try {
      const response = await fetch(`http://localhost:5000/api/admin/productsByCategory/${category_id}`);
      
      // Burada response objesini kontrol etmemiz gerek
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.length === 0) {
        setIsAvailable(false); // Ürün yoksa is_available'ı false yap
        setProducts([]); // Ürünleri sıfırla
      } else {
        setIsAvailable(true);
        setProducts(data); // Ürünleri setle
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <>
      <Carousel className='category-slider' dotPosition='top' slidesToShow={6} arrows={true} style={contentStyle} slidesToScroll={2} autoplaySpeed={2000} autoplay>
        {
          categories.map((category) => (
            <div key={category.category_id}>
              <Card
                className='category-card'
                onClick={() => handleCategoryClick(category.category_id)}
                style={{ width: "130px", height: "130px",justifyContent:"center",marginLeft:"50px" }}
                hoverable
                cover={
                  category.image_url ? (
                    <img
                      style={{ width: "130px", height: "80px" }}
                      alt={category.category_name}
                      src={`http://localhost:5000/images/${category.image_url}`}
                    />
                  ) : null
                }
              >
                <Meta title={category.category_name} />
              </Card>
            </div>
          ))
        }
      </Carousel>

      
      <Checkbox.Group options={['AltKategori1', 'AltKategori2']} />   

      <div>
        <Card style={{ marginTop: "5%" }}>
          <h4>Ürünler</h4>
          {
            is_available ? (
              products.length > 0 ? (
                products.map((product) => (
                  <div key={product.product_id} style={{ marginBottom: "10px",padding:"0 0 5px" }}>
                    <Card
                      style={{ width: "250px" }}
                      hoverable
                      cover={
                        product.image_url ? (
                          <img
                            alt={product.product_name}
                            src={`http://localhost:5000/images/${product.image_url}`}
                          />
                        ) : null
                      }
                    >
                      <Meta title={product.product_name} />
                    </Card>
                  </div>
                ))
              ) : (
                <p>Bu kategoriye ait herhangi bir ürün yok.</p>
              )
            ) : (
              <p>Bu kategoriye ait herhangi bir ürün yok.</p>
            )
          }
        </Card>
      </div>
    </>
  );
};

export default App;
