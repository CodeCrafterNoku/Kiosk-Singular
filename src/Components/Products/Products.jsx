import React, { useEffect, useState } from 'react';
import "./Products.css";
import { toast } from 'react-toastify'; 
import { AiOutlineCheck } from 'react-icons/ai';
import { MdAddBox } from "react-icons/md";


function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
   const [currentPage, setCurrentPage] = useState(1); // ✅
  const [productsPerPage] = useState(12); // ✅ Number of products per page

  


  const handleCategorySelect = (categoryName) => {
    setSelectedCategoryName(categoryName);
    setCurrentPage(1);
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

    const isOutOfStock = product.quantity === 0; // Check if the product is out of stock
    const isUnavailableWithStock = !product.isAvailable && product.quantity > 0; // Check if unavailable but has stock

    return matchesCategory && matchesSearch && (isOutOfStock || (!isUnavailableWithStock)); // Include the conditions
  });
  const indexOfLastProduct = currentPage * productsPerPage; // ✅
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage; // ✅
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct); // ✅
  const paginate = (pageNumber) => setCurrentPage(pageNumber); // ✅

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

        return await response.json(); // Return the created cart
    } catch (error) {
        console.error("Error creating cart:", error);
    }
};


const addToCart = async (productId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("You must be logged in to add items to your cart.");
        return;
    }

    try {
        // Check for existing cart
        const cartResponse = await fetch(`http://localhost:5279/api/cart/user/${userId}`);
        let cartData;

        if (cartResponse.status === 404) {
            // Create a new cart if it doesn't exist
            cartData = await createCart(userId);
        } else {
            cartData = await cartResponse.json();
        }

        // Prepare the request body to add the cart item
        const requestBody = {
            cartItemID: 0,
            cartID: cartData.cartID,
            productID: productId,
            quantity: 1,
            unitPrice: 0, // Fetch the product price based on productId if needed
            productName: "Product Name" // Fetch or set dynamically
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
            autoClose: 600,
            hideProgressBar: true,
            closeButton: false,
          }
        );

    } catch (error) {
        console.error("Error adding item to cart:", error);
        alert("An error occurred while adding the item to the cart.");
    }
};

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
  {currentProducts.map((product) => ( // ✅ Use currentProducts for pagination
    <section className="card" key={product.productID}>
      <div className="image-container">
        <img
          src={product.imageURL || "https://via.placeholder.com/150"}
          alt={product.productName}
        />
        {product.quantity === 0 && (
          <div className="overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>
      <div className="card-details">
        <h3 className="card-title">{product.productName}</h3>
        <section className="card-description">
          <h4>{product.productDescription}</h4>
        </section>
        <p className="card-quantity">Qty: {product.quantity}</p>
        <div className="card-price-row">
          <p className="card-price">R{product.price?.toFixed(2)}</p>
          <MdAddBox
            className="add-icon"
            onClick={() => product.quantity > 0 && addToCart(product.productID)}
            style={{ cursor: product.quantity === 0 ? 'not-allowed' : 'pointer', opacity: product.quantity === 0 ? 0.5 : 1 }}
          />
        </div>
      </div>
    </section>
  ))}
</section>
 {/* ✅ Pagination controls */}
            <div className="pagination">
              {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={currentPage === index + 1 ? 'active' : ''}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
          
        )}
      </div>
    </>
  );
}

export default Products;