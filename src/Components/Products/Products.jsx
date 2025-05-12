import React, { useEffect, useState } from 'react';
import "./Products.css";
import { MdAddBox } from "react-icons/md";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCategorySelect = (categoryName) => {
    setSelectedCategoryName(categoryName);
  };

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
    } finally {
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategoryName(e.target.value);
  };

  const selectedCategory = categories.find(
    (cat) => cat.categoryName === selectedCategoryName
  );

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory
      ? String(product.categoryID) === String(selectedCategory.categoryID)
      : true;

    const matchesSearch = product.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const isInStock = product.quantity > 0; // Check if the product is in stock

    return matchesCategory && matchesSearch && isInStock; // Include the in-stock condition
  });

  return (
    <>
      <div className="page-container">
        {error && <p className="error">Error: {error}</p>}
        {loading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="category-buttons-container">
              <button
                onClick={() => handleCategorySelect('')}
                className={selectedCategoryName === '' ? 'active' : ''}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.categoryID}
                  onClick={() => handleCategorySelect(category.categoryName)}
                  className={selectedCategoryName === category.categoryName ? 'active' : ''}
                >
                  {category.categoryName}
                </button>
              ))}
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
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
                    <div className="card-price-row">
                      <p className="card-price">R{product.price?.toFixed(2)}</p>
                      <MdAddBox className="add-icon" />
                    </div>
                  </div>
                </section>
              ))}
            </section>
          </>
        )}
      </div>
    </>
  );
}

export default Products;