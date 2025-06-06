import React, { useEffect, useState } from 'react';
import './ProductAdmin.css';
import { toast } from 'react-toastify'; 
import { AiOutlineCheck } from 'react-icons/ai'; 
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
        isAvailable: true
    });
    const [selectedCategory, setSelectedCategory] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteProductId, setDeleteProductId] = useState(null);
    const [popup, setPopup] = useState(null);
    const [showAddProductPopup, setShowAddProductPopup] = useState(false);
    const [showUpdateProductPopup, setShowUpdateProductPopup] = useState(false);
    const [isImageUploaded, setIsImageUploaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(7);

    const addToCart = async (productId) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert("You must be logged in to add items to your cart.");
            return;
        }

        try {
            const cartResponse = await fetch(`http://localhost:5279/api/cart/user/${userId}`);
            let cartData;

            if (cartResponse.status === 404) {
                cartData = await createCart(userId);
            } else {
                cartData = await cartResponse.json();
            }

            const requestBody = {
                cartItemID: 0,
                cartID: cartData.cartID,
                productID: productId,
                quantity: 1,
                unitPrice: 0,
                productName: products.find(product => product.productID === productId)?.productName
            };

            const response = await fetch(`http://localhost:5279/api/cart/${requestBody.cartID}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to add item to cart: ${errorData.message || response.statusText}`);
                return;
            }

            // Show success toast
            toast.success(
                <span>
                    <AiOutlineCheck /> Item added to cart successfully!
                </span>,
                {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeButton: false,
                }
            );

        } catch (error) {
            console.error("Error adding item to cart:", error);
            alert("An error occurred while adding the item to the cart.");
        }
    };

    const createCart = async (userId) => {
        const requestBody = {
            userID: Number(userId),
            walletID: 0,
            lastModified: new Date().toISOString(),
        };

        try {
            const response = await fetch('http://localhost:5279/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Cart creation failed:", errorText);
                throw new Error(errorText);
            }

            return await response.json();
        } catch (error) {
            console.error("Error creating cart:", error);
        }
    };

    const [confirmToggle, setConfirmToggle] = useState(null);

    const handleAvailabilityToggle = (productId, currentAvailability) => {
        if (!productId) return;

        setIsUpdateLoading(true);

        try {
            const product = products.find(p => p.productID === productId);

            if (!product) {
                console.error(`Product with ID ${productId} not found.`);
                return;
            }

            if (product.quantity > 0 && currentAvailability) {
                setConfirmToggle({ productId, currentAvailability });
                return;
            }

            toggleProductAvailability(productId, currentAvailability);
        } catch (error) {
            console.error("Error toggling availability:", error);
            setPopup({ message: `Error: ${error.message}`, type: 'error' });
        } finally {
            setIsUpdateLoading(false);
        }
    };

    const toggleProductAvailability = async (productId, currentAvailability) => {
        const updatedProduct = {
            ...products.find(p => p.productID === productId),
            isAvailable: !currentAvailability
        };

        const response = await fetch(`http://localhost:5279/api/Product/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProduct),
        });

        if (response.ok) {
            setPopup({ message: 'Product availability updated successfully', type: 'success' });
            fetchProducts();
        } else {
            const errorData = await response.json();
            console.error("Failed to update availability:", errorData);
            setPopup({ message: `${errorData.message || 'Failed to update availability'}`, type: 'error' });
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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
        const productData = { ...newProduct };

        if (
            !productData.productName.trim() ||
            !productData.productDescription.trim() ||
            !productData.categoryID ||
            !productData.imageURL.trim() ||
            !isImageUploaded
        ) {
            setPopup({ message: 'Please fill in all required fields.', type: 'error' });
            return;
        }

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
            const errorMessage = await response.text();
            setPopup({ message: `Failed to add product: ${errorMessage}`, type: 'error' });
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
        setIsUpdateLoading(true);

        const updatedAvailability = editingProduct.quantity > 0;
        const updatedProduct = { ...editingProduct, isAvailable: updatedAvailability };

        const response = await fetch(`http://localhost:5279/api/Product/${updatedProduct.productID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct),
        });

        if (response.ok) {
            setPopup({ message: 'Product updated successfully', type: 'success' });
            fetchProducts();
            setEditingProduct(null);
            setShowUpdateProductPopup(false);
        } else {
            setPopup({ message: 'Failed to update product. It did not meet the required specifications.', type: 'error' });
        }
        setIsUpdateLoading(false);
    };

    const handleCategoryChange = (categoryID) => {
        setSelectedCategory(categoryID); // Set the selected category
        setCurrentPage(1); // Reset to the first page when category changes
    };

    const filteredProducts = products.filter((product) => {
        const matchesCategory = !selectedCategory ||
            String(product.categoryID) === String(selectedCategory);
        const matchesSearch = !searchTerm ||
            product.productName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Pagination Logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleEditProduct = (product) => {
        setEditingProduct({ ...product });
        setShowUpdateProductPopup(true);
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

    const ConfirmPopup = ({ onConfirm, onCancel }) => {
        return (
            <div className="popup-overlay">
                <div className="popup">
                    <p>This product still has quantity available. Are you sure you want to make it unavailable?</p>
                    <div className="button-container">
                        <button onClick={onConfirm}>Yes</button>
                        <button onClick={onCancel}>No</button>
                    </div>
                </div>
            </div>
        );
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "kiosk_system");

        setIsLoading(true);
        fetch("https://api.cloudinary.com/v1_1/diet4t4b9/image/upload", {
            method: "POST",
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Upload failed: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                const imageUrl = data.secure_url;
                setNewProduct(prevProduct => ({
                    ...prevProduct,
                    imageURL: imageUrl,
                }));
                setIsImageUploaded(true);
            })
            .catch(error => {
                console.error("Error uploading image:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleImageUploadForUpdate = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "kiosk_system");

        setIsUpdateLoading(true);
        fetch("https://api.cloudinary.com/v1_1/diet4t4b9/image/upload", {
            method: "POST",
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Upload failed: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                const imageUrl = data.secure_url;
                setEditingProduct(prevProduct => ({
                    ...prevProduct,
                    imageURL: imageUrl,
                }));
                setIsImageUploaded(true);
            })
            .catch(error => {
                console.error("Error uploading image:", error);
            })
            .finally(() => {
                setIsUpdateLoading(false);
            });
    };

    return (
        <div className="main-container"> {/* Add this wrapper */}
            {error && <p className="error">Error: {error}</p>}
            {isLoading && <div className="spinner">Loading...</div>}

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
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e)}
                            />
                            <div className="form-buttons">
                                <button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Uploading...' : 'Add Product'}
                                </button>
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
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUploadForUpdate(e)}
                            />
                            <div className="form-buttons">
                                <button type="submit" disabled={isUpdateLoading}>
                                    {isUpdateLoading ? 'Uploading...' : 'Update Product'}
                                </button>
                                <button type="button" onClick={() => setShowUpdateProductPopup(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="content"> {/* Wrap your main content */}
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
                    <div className="product-search-container">
                        <input
                           type="text"
                            placeholder="Search products by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="table-container"> 
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Available</th>
                                <th>Add to Cart</th>
                                <th>Edit</th>
                                <th>Delete</th>
                            </tr>
                       </thead>
                        <tbody>
                            {currentProducts.map((product) => (
                                <tr key={product.productID}>
                                    <td>
                                        <img src={product.imageURL || 'https://via.placeholder.com/50'} alt={product.productName} width="50" />
                                    </td>
                                    <td>{product.productName}</td>
                                    <td>{product.productDescription}</td>
                                    <td>R{parseFloat(product.price).toFixed(2)}</td>
                                    <td>{product.quantity}</td>
                                    <td>
                                        <label className={`availability-label ${product.quantity > 0 && !product.isAvailable ? 'forced-unavailable' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={product.isAvailable}
                                                onChange={() => handleAvailabilityToggle(product.productID, product.isAvailable)}
                                            />
                                            {product.isAvailable ? "Available" : "Not Available"}
                                            {product.quantity > 0 && !product.isAvailable && (
                                                <span className="availability-note"> (Admin override)</span>
                                            )}
                                        </label>
                                    </td>
                                    <td>
                                        <MdAddBox
                                            className="add-icon"
                                            onClick={() => product.quantity > 0 && addToCart(product.productID)}
                                            style={{ cursor: product.quantity === 0 ? 'not-allowed' : 'pointer', opacity: product.quantity === 0 ? 0.5 : 1 }}
                                        />
                                    </td>
                                    <td>
                                        <button className="button" onClick={() => handleEditProduct(product)}>Edit</button>
                                    </td>
                                    <td>
                                        <button className="button delete" onClick={() => handleConfirmDelete(product.productID)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
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
            
            {confirmToggle && 
                <ConfirmPopup 
                    onConfirm={() => {
                        toggleProductAvailability(confirmToggle.productId, confirmToggle.currentAvailability);
                        setConfirmToggle(null);
                    }} 
                    onCancel={() => setConfirmToggle(null)} 
                />
            }
        </div> 
    );
}

export default ProductAdmin;