import React, { useEffect, useState } from 'react';
import "./Products.css";


function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5279/api/Product', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched products:', data);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      {error && <p className="error">Error: {error}</p>}
      <section className="card-container">
        {products.map(product => (
          <section className="card" key={product.productID}>
            <img
              src={product.imageURL || "https://via.placeholder.com/150"}
              alt={product.productName}
            />
            <div className="card-details">
              <h3 className="card-title">{product.productName}</h3>
              <section className="card-description">
                <h4>{product.productDescription}</h4>
              </section>
              <p className="card-price">R{product.price ? product.price.toFixed(2) : 'N/A'}</p>
            </div>
          </section>
        ))}
      </section>
    </>
  );
}

export default Products;
