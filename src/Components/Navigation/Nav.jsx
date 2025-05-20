import { useState, useEffect } from 'react';
import { FiHeart, FiMenu } from 'react-icons/fi';
import { FaShoppingCart } from 'react-icons/fa';
import { BsFillWalletFill } from "react-icons/bs";
import { MdLightMode } from 'react-icons/md';
import { MdOutlineShoppingCartCheckout } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import './Nav.css';

function Nav({ name }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [fundAmount, setFundAmount] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("No userId in localStorage");
      return;
    }

    fetch(`http://localhost:5279/api/wallet/user/${userId}`)
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch wallet");
        return response.json();
      })
      .then(data => {
        setWalletBalance(Number(data.balance).toFixed(2));
      })
      .catch(error => {
        console.error("Wallet fetch error:", error);
      });
    
    fetchCartByUser(userId);
  }, []);

  const fetchCartByUser = async (userId) => {
    try {
      const cartResponse = await fetch(`http://localhost:5279/api/cart/user/${userId}`);
      if (!cartResponse.ok) throw new Error("Failed to fetch cart");

      const cartData = await cartResponse.json();
      setTotalAmount(cartData.totalAmount);
      setCartItems(cartData.cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = (action) => {
    setDrawerOpen(false);
    if (action === 'Logout') {
      navigate('/');
    }
  };

  const addFunds = async () => {
    const userId = localStorage.getItem("userId");
    const amountToAdd = Number(fundAmount);

    if (!fundAmount || isNaN(amountToAdd) || amountToAdd <= 0) {
      alert("Please enter a valid amount greater than zero");
      return;
    }

    if (!userId) {
      alert("User not logged in");
      return;
    }

    const requestBody = {
      userID: Number(userId),
      balance: amountToAdd,
      walletID: 0,
      lastUpdated: new Date().toISOString(),
      userName: "string" // Replace with actual user name if needed
    };

    try {
      const response = await fetch('http://localhost:5279/api/wallet/addfunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to add funds: ${errorData.message || response.statusText}`);
        return;
      }

      setWalletBalance(prevBalance => (Number(prevBalance) + amountToAdd).toFixed(2));
      setFundAmount('');
      setShowWalletDropdown(false);
      alert(`Successfully funded wallet with R${amountToAdd}`);
    } catch (error) {
      console.error('Error adding funds:', error);
      alert('An error occurred while adding funds.');
    }
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

const deleteCartItem = async (cartItemId) => {
  const userId = localStorage.getItem("userId");
  try {
    const response = await fetch(`http://localhost:5279/api/cartitem/${cartItemId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      fetchCartByUser(userId); // Refresh the cart items
    } else {
      console.error('Error deleting item');
    }
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};


  const handleCheckout = () => {
    // Implement checkout logic here
    alert('Proceeding to Checkout');
  };

  return (
    <nav>
      <div className="logo-container">
        <img src="/singular.png" alt="Company Logo" className="logo" />
      </div>

      <div className="profile-container">
        <a href="#"><MdLightMode className="nav-icons" /></a>
        <a href="#"><FiHeart className="nav-icons" /></a>
        <a href="#" onClick={toggleCart} className="cart-icon">
          <FaShoppingCart className="nav-icons" />
          {cartItems.length > 0 && (
            <span className="cart-item-count">{cartItems.length}</span>
          )}
        </a>
        <a href="#" className="wallet-container" onClick={() => setShowWalletDropdown(prev => !prev)}>
          <BsFillWalletFill className="nav-icons" />
          <span className="wallet-balance">BALANCE R{walletBalance}</span>
        </a>

        {showWalletDropdown && (
          <div className="wallet-dropdown">
            <input
              type="number"
              min="1"
              placeholder="Enter amount"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
            />
            <button onClick={addFunds}>
              Fund
            </button>
          </div>
        )}

        <a href="#" className="menu-icon" onClick={toggleDrawer}>
          <FiMenu className="nav-icons" />
        </a>
      </div>

      {/* Pop-up for cart items */}
          {showCart && (
            <div className="cart-popup">
              <h3>Cart Items</h3>
              <ul>
                {cartItems.map(item => (
                  <li key={item.cartItemID}>
                    <span>
                      {item.productName} - Qty: {item.quantity} - R{item.unitPrice}
                    </span>
                    <RiDeleteBinLine className="delete-icon" onClick={() => deleteCartItem(item.cartItemID)} />
                  </li>
                ))}
              </ul>
              <h4>Total: R{totalAmount}</h4>
              <button onClick={handleCheckout}>
                <MdOutlineShoppingCartCheckout /> Checkout
              </button>
              <button onClick={toggleCart} className="close-cart">
                Close
              </button>
            </div>
          )}

      {drawerOpen && (
        <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
          <ul>
            <li onClick={() => handleMenuItemClick('View Orders')}>View Orders</li>
            <li onClick={() => handleMenuItemClick('Account Settings')}>Account Settings</li>
            <li onClick={() => handleMenuItemClick('Logout')}>Logout</li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Nav;