import React, { useEffect, useState } from 'react';
import './ProductAdmin.css';
import { MdAddBox } from "react-icons/md";

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
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [popup, setPopup] = useState(null);
  const [showAddProductPopup, setShowAddProductPopup] = useState(false);
  const [showUpdateProductPopup, setShowUpdateProductPopup] = useState(false); // New state for update popup

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5279/api/Product', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
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
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddProduct = async () => {
    const productExists = products.some((product) => product.productName.toLowerCase() === newProduct.productName.toLowerCase());

    if (productExists) {
      setPopup({ message: 'Product already exists. Please try a different name.', type: 'error' });
      return;
    }
    const response = await fetch('http://localhost:5279/api/Product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });

    if (response.ok) {
      setPopup({ message: 'Product added successfully', type: 'success' });
      fetchProducts();
      setShowAddProductPopup(false);
      setNewProduct({ productName: '', productDescription: '', price: '', quantity: '', categoryID: '', imageURL: '' });
    } else {
      setPopup({ message: 'Failed to add product. It did not meet the required specifications', type: 'error' });
    }
  };

  const handleDeleteProduct = async (productId) => {
    const response = await fetch(`http://localhost:5279/api/Product/${productId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchProducts();
      setDeleteProductId(null);
      setPopup({ message: 'Product deleted successfully', type: 'success' });
    } else {
      setPopup({ message: 'Failed to delete product', type: 'error' });
      setDeleteProductId(null);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    const response = await fetch(`http://localhost:5279/api/Product/${editingProduct.productID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingProduct),
    });

    if (response.ok) {
      setPopup({ message: 'Product updated successfully', type: 'success' });
      fetchProducts();
      setEditingProduct(null);
      setShowUpdateProductPopup(false); // Close the update popup
    } else {
      setPopup({ message: 'Failed to update product. It did not meet the required specifications.', type: 'error' });
    }
  };

  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);

  const filteredProducts = selectedCategory
    ? products.filter((product) => String(product.categoryID) === String(selectedCategory))
    : products;

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
    setShowUpdateProductPopup(true); // Open the update popup
  };

  const handleConfirmDelete = (productId) => setDeleteProductId(productId);
  const handleCancelDelete = () => setDeleteProductId(null);

  const Popup = ({ message, type, onClose }) => {
    return (
      <div className={`popup-overlay ${type}`}>
        <div className="popup">
          <p>{message}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };

  return (
    <>
      {error && <p className="error">Error: {error}</p>}

      {/* Add Product Popup */}
      {showAddProductPopup && (
        <div className="popup-overlay">
          <div className="popup">
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
              <select value={newProduct.categoryID} onChange={(e) => setNewProduct({ ...newProduct, categoryID: e.target.value })}>
                <option value="">Select Category</option>
                {categories.map((category) => (
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
<div className="form-buttons">
  <button type="submit">Add Product</button>
  <button type="button" onClick={() => setShowAddProductPopup(false)}>Cancel</button>
</div>
            </form>
          </div>
        </div>
      )}

      {/* Update Product Popup */}
      {showUpdateProductPopup && (
        <div className="popup-overlay">
          <div className="popup">
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
                {categories.map((category) => (
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
<div className="form-buttons">
  <button type="submit">Update Product</button>
  <button type="button" onClick={() => setShowUpdateProductPopup(false)}>Cancel</button>
</div>

            </form>
          </div>
        </div>
      )}

      <div>
        <div className="category-buttons-container">
          <button onClick={() => setSelectedCategory('')} className={selectedCategory === '' ? 'active' : ''}>
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.categoryID}
              onClick={() => setSelectedCategory(category.categoryID)}
              className={selectedCategory === category.categoryID ? 'active' : ''}
            >
              {category.categoryName}
            </button>
          ))}
          <button className="add-product-button" onClick={() => setShowAddProductPopup(true)}>
            Add New Product
          </button>
        </div>
        
        <div className="card-container">
          {filteredProducts.map((product) => (
<div key={product.productID} className="card">
  <img
    src={product.imageURL || 'https://via.placeholder.com/150'}
    alt={product.productName}
    className={product.quantity === 0 ? 'out-of-stock-image' : ''}
  />
  {product.quantity === 0 && (
    <div className="out-of-stock-overlay">
      <span>Not Available</span>
    </div>
  )}
  <div className="card-details">
    <h3 className="product-name">{product.productName}</h3>
    <p className="product-description">{product.productDescription}</p>
    <p>Price: R{product.price}</p>
    <p>Quantity: {product.quantity}</p>
    <div className="card-buttons">
  <button onClick={() => handleEditProduct(product)}>Edit</button>
  <button onClick={() => handleConfirmDelete(product.productID)}>Delete</button>
</div>
  </div>
</div>

          ))}
        </div>
      </div>

      {deleteProductId && (
        <div className="delete-popup-overlay">
          <div className="delete-popup">
            <p>Are you sure you want to delete this product?</p>
            <button onClick={() => handleDeleteProduct(deleteProductId)}>Yes</button>
            <button onClick={handleCancelDelete}>No</button>
          </div>
        </div>
      )}

      {popup && <Popup message={popup.message} type={popup.type} onClose={() => setPopup(null)} />}
    </>
  );
}

export default ProductAdmin;