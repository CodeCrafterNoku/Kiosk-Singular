import React, { useEffect, useState } from 'react';
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5279/api/Product', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5279/api/Category', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategoryName(e.target.value);
  };

  const selectedCategory = categories.find(
    (cat) => cat.categoryName === selectedCategoryName
  );

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) => String(product.categoryID) === String(selectedCategory.categoryID)
      )
    : products;

  return (
    <>
      {error && <p className="error">Error: {error}</p>}
      <div>
        <label>Filter by Category:</label>
        <select onChange={handleCategoryChange} value={selectedCategoryName}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.categoryID} value={category.categoryName}>
              {category.categoryName}
            </option>
          ))}
        </select>
      </div>

      <section className="card-container">
        {filteredProducts.map((product) => (
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
              <p className="card-price">R{product.price?.toFixed(2)}</p>
            </div>
          </section>
        ))}
      </section>
    </>
  );
}

export default Products;
