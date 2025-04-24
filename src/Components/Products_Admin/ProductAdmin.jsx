import React, { useEffect, useState } from 'react';
import './ProductAdmin.css';

function ProductAdmin() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    productName: '',
    productDescription: '',
    price: '',
    quantity: '',
    categoryID: '',
    imageURL: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState(null); // New state for editing

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
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5279/api/Category', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddProduct = async () => {
    const response = await fetch('http://localhost:5279/api/Product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    });

    if (response.ok) {
      alert('Product added successfully');
      fetchProducts();
    } else {
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const response = await fetch(`http://localhost:5279/api/Product/${productId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Product deleted successfully');
      fetchProducts();
    } else {
      alert('Failed to delete product');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    const response = await fetch(`http://localhost:5279/api/Product/${editingProduct.productID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingProduct), // Use editingProduct for update
    });

    if (response.ok) {
      alert('Product updated successfully');
      fetchProducts();
      setEditingProduct(null); // Reset editing state after update
    } else {
      alert('Failed to update product');
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const filteredProducts = selectedCategory
  ? products.filter(product => String(product.categoryID) === String(selectedCategory))
  : products;

  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product, // Set the editingProduct state to the product that is being edited
    });
  };

  return (
    <>
      <h2>Admin Product Management</h2>
      {error && <p className="error">Error: {error}</p>}
      
      <div>
        <h3>Add Product</h3>
        <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }}>
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.productName}
            onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
          />
          <textarea
            placeholder="Product Description"
            value={newProduct.productDescription}
            onChange={(e) => setNewProduct({ ...newProduct, productDescription: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newProduct.quantity}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
          />
          <select
            value={newProduct.categoryID}
            onChange={(e) => setNewProduct({ ...newProduct, categoryID: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.categoryID} value={category.categoryID}>
                {category.categoryName}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Image URL"
            value={newProduct.imageURL}
            onChange={(e) => setNewProduct({ ...newProduct, imageURL: e.target.value })}
          />
          <button type="submit">Add Product</button>
        </form>
      </div>

      <div>
  <h3>Products</h3>
  <div className="category-buttons-container">
    <button 
      onClick={() => setSelectedCategory('')} 
      className={selectedCategory === '' ? 'active' : ''}
    >
      All Categories
    </button>
    {categories.map(category => (
      <button 
        key={category.categoryID} 
        onClick={() => setSelectedCategory(category.categoryID)} 
        className={selectedCategory === category.categoryID ? 'active' : ''}
      >
        {category.categoryName}
      </button>
    ))}
  </div>
  <div className="card-container">
    {filteredProducts.map(product => (
      <div key={product.productID} className="card">
        <img
          src={product.imageURL || "https://via.placeholder.com/150"}
          alt={product.productName}
        />
        <div className="card-details">
          <h3>{product.productName}</h3>
          <p>{product.productDescription}</p>
          <p>Price: R{product.price}</p>
          <p>Quantity: {product.quantity}</p>
          <button onClick={() => handleEditProduct(product)}>Edit</button>
          <button onClick={() => handleDeleteProduct(product.productID)}>Delete</button>
        </div>
      </div>
    ))}
  </div>
</div>

      {editingProduct && (
        <div>
          <h3>Update Product</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(); }}>
            <input
              type="text"
              placeholder="Product Name"
              value={editingProduct.productName}
              onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
            />
            <textarea
              placeholder="Product Description"
              value={editingProduct.productDescription}
              onChange={(e) => setEditingProduct({ ...editingProduct, productDescription: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={editingProduct.quantity}
              onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
            />
            <select
              value={editingProduct.categoryID}
              onChange={(e) => setEditingProduct({ ...editingProduct, categoryID: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.categoryID} value={category.categoryID}>
                  {category.categoryName}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Image URL"
              value={editingProduct.imageURL}
              onChange={(e) => setEditingProduct({ ...editingProduct, imageURL: e.target.value })}
            />
            <button type="submit">Update Product</button>
          </form>
        </div>
      )}
    </>
  );
}

export default ProductAdmin;
