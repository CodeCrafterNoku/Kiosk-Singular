import { useState, useEffect } from 'react';
import { FiHeart, FiMenu } from 'react-icons/fi';
import { FaShoppingCart } from 'react-icons/fa';
import { BsFillWalletFill } from "react-icons/bs";
import { MdLightMode } from 'react-icons/md';
import { MdOutlineShoppingCartCheckout } from "react-icons/md";
import { HiBellAlert } from "react-icons/hi2";
import { RiDeleteBinLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import FundUser from './fundUser';
import { AiFillHome } from "react-icons/ai";
import { Link } from 'react-router-dom';
import './Nav.css';

function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0.00);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFundUserModal, setShowFundUserModal] = useState(false);
  const isBalanceExceeded = parseFloat(totalAmount) > parseFloat(walletBalance);
  const [showOrderSummary, setShowOrderSummary] = useState(false); // New state for order summary
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState("Pickup");
  const [orderSummaryData, setOrderSummaryData] = useState({});
  const [orders, setOrders] = useState([]); 
  const userId = localStorage.getItem("userId");

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



 const addFunds = async () => {
    const userId = localStorage.getItem("userId");
    const amountToAdd = Number(fundAmount);

    if (!fundAmount || isNaN(amountToAdd) || amountToAdd <= 0) {
        alert("Please enter a valid amount greater than zero");
        return;
    }

    const requestBody = {
        walletID: walletID, // Use the wallet ID if available
        userID: userId,
        balance: amountToAdd,
        lastUpdated: new Date().toISOString(),
        userName: "Sinethemba" // Replace with actual user name if needed
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

        const data = await response.json();
        setWalletBalance(prevBalance => (Number(data.newBalance)).toFixed(2));
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

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5279/api/Product');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      throw error;
    }
  };
  

  const deleteCartItem = async (cartItemId) => {
    setIsLoading(true);
    setError(null);
    const userId = localStorage.getItem("userId");
    
    try {
      const response = await fetch(`http://localhost:5279/api/Cart/cartitem/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }

      await Promise.all([
        fetchCartByUser(userId),
        fetchProducts()
      ]);
      
      alert('Item deleted successfully!');
      
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const cartID = localStorage.getItem("cartID");
  const walletID = localStorage.getItem("walletID");


const handleCheckout = async () => {
    const userId = localStorage.getItem("userId");

    if (cartItems.length === 0) {
        alert("Cart is empty.");
        return;
    }

    const subtotal = cartItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
    const deliveryFee = selectedDeliveryMethod === "Delivery" ? 10 : 0; // Adjust based on delivery method
    const totalAmount = subtotal + deliveryFee;

    // Prepare order data
    const checkoutData = {
        UserID: Number(userId),
        DeliveryMethod: selectedDeliveryMethod,
        Subtotal: subtotal,
        DeliveryFee: deliveryFee,
        TotalAmount: totalAmount,
        OrderStatus: "Pending",
        OrderDateTime: new Date(),
        CartItems: cartItems.map(item => ({
            ProductID: item.productID,
            Quantity: item.quantity,
            UnitPrice: item.unitPrice,
        })),
    };

    try {
        const response = await fetch('http://localhost:5279/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            alert(`Checkout failed: ${errorText}`);
            return;
        }

        const orderResponse = await response.json(); // Get the order response
        localStorage.setItem("orderID", orderResponse.orderID); // Store the order ID
        alert('Checkout successful!');
        
        setCartItems([]); // Clear the cart after successful order creation
        setTotalAmount(0);
        setWalletBalance(prevBalance => (Number(prevBalance) - totalAmount).toFixed(2));

        // Call createTransaction after successful checkout
        await createTransaction(totalAmount);
    } catch (error) {
        console.error('Checkout error:', error);
        alert('An error occurred during checkout.');
    }
};
// Example of setting walletID when fetching the wallet
const fetchWallet = async (userId) => {
    try {
        const response = await fetch(`http://localhost:5279/api/wallet/user/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch wallet");
        const data = await response.json();
        setWalletBalance(Number(data.balance).toFixed(2));
        localStorage.setItem("walletID", data.walletID); // Ensure this is set
        console.log('Fetched Wallet ID:', data.walletID); // Debug log
    } catch (error) {
        console.error("Wallet fetch error:", error);
    }
};
useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        console.warn("No userId in localStorage");
        return;
    }
    fetchWallet(userId); // Call to fetch wallet here
    fetchCartByUser(userId);
}, []);
const createTransaction = async (totalAmount) => {
    const userId = localStorage.getItem("userId");
    const walletID = localStorage.getItem("walletID");
    const orderID = localStorage.getItem("orderID"); // Ensure orderID is set correctly

    // Log wallet ID to check its value
    console.log('Retrieved Wallet ID:', walletID);

    // Validate walletID and orderID
    if (!walletID || walletID === "0") {
        alert("Invalid Wallet ID.");
        return;
    }
    
    if (!orderID || orderID === "0") {
        alert("Invalid Order ID.");
        return;
    }

    const transactionData = {
        transactionID: 0, // Assuming this is auto-generated on the server
        walletID: Number(walletID),
        amount: totalAmount,
        orderID: Number(orderID),
        paymentMethod: 'EFT',
        paymentDateTime: new Date().toISOString(), // Ensure this is in ISO format
        paymentStatus: 'Completed' // Set payment status if required
    };

    console.log('Transaction Data:', transactionData); // Log the data for debugging

    try {
        const response = await fetch('http://localhost:5279/api/Transaction/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            },
            body: JSON.stringify(transactionData),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Transaction created successfully:", data);
            alert('Transaction successful!');
            // Optionally, update wallet balance or navigate to another page
        } else {
            const errorData = await response.json();
            alert(`Transaction failed: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Transaction error:', error);
        alert('An error occurred during the transaction.');
    }
};
const handleMenuItemClick = (action) => {
  setDrawerOpen(false);
  if (action === 'View Orders') {
    const userId = localStorage.getItem("userId");
    fetchOrdersByUser(userId); // Fetch user orders
    setShowOrderSummary(true); // Show the order modal
  } else if (action === 'Logout') {
    navigate('/');
  }
};

  const toggleFundUserModal = () => {
    setShowFundUserModal(!showFundUserModal);
  };
  
  const userRole = localStorage.getItem("roleID");

    const updateCartItemQuantity = async (cartItemId, newQuantity) => {
    const userId = localStorage.getItem("userId");
    
    // Prepare request body for updating the cart item
    const requestBody = {
        quantity: newQuantity,
    };
    try {
        const response = await fetch(`http://localhost:5279/api/cart/cartitem/${cartItemId}`, {
            method: 'PUT', // Use PUT or PATCH depending on your API design
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Failed to update item quantity: ${errorData.message || response.statusText}`);
            return;
        }

        // Refresh cart items after update
        fetchCartByUser(userId);
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        alert('An error occurred while updating the item quantity.');
    }
};
const fetchOrdersByUser = async (userId) => {
  try {
    const response = await fetch(`http://localhost:5279/api/order/user/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch orders");

    const ordersData = await response.json();
    setOrders(ordersData);
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

const confirmOrder = async () => {
    const userId = localStorage.getItem("userId");
    const walletID = localStorage.getItem("walletID");

    const { subtotal, deliveryFee, totalAmount, deliveryMethod } = orderSummaryData;

    const checkoutData = {
        UserID: Number(userId),
        DeliveryMethod: deliveryMethod,
        PaymentMethod: "Wallet",
        WalletID: Number(walletID),
        CartID: cartItems?.cartID || 0,
        Subtotal: subtotal,
        DeliveryFee: deliveryFee,
        TotalAmount: totalAmount,
        OrderStatus: "Pending",
        OrderDateTime: new Date(),
        CartItems: cartItems.map(item => ({
            ProductID: item.productID,
            ProductName: item.productName,
            Quantity: item.quantity,
            UnitPrice: item.unitPrice,
        })),
    };

    try {
        const response = await fetch('http://localhost:5279/api/order/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            alert(`Checkout failed: ${errorText}`);
            return;
        }

        alert('Checkout successful!');
        setCartItems([]); // Clear the cart after successful order creation
        setTotalAmount(0);
        setWalletBalance(prevBalance => (Number(prevBalance) - totalAmount).toFixed(2));
    } catch (error) {
        console.error('Checkout error:', error);
        alert('An error occurred during checkout.');
    }
};
  return (
    <nav>
      <div className="logo-container">
        <img src="/singular.png" alt="Company Logo" className="logo" />
      </div>

      <div className="profile-container">
        <a href="#"><AiFillHome className="nav-icons" /></a>
        <Link to="/orders" className="notification-icon">
          <HiBellAlert className="nav-icons" />
        </Link>
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
            <button onClick={addFunds}>Fund</button>

            {/* Conditionally render the Fund User button */}
            {userRole === '8' && ( // Check if the user is an Admin
              <button onClick={toggleFundUserModal}>Fund User</button>
            )}
          </div>
        )}

        <a href="#" className="menu-icon" onClick={toggleDrawer}>
          <FiMenu className="nav-icons" />
        </a>
      </div>

     {showCart && (
    <div className="cart-popup">
        <h3>Cart Items</h3>
        <ul>
            {cartItems.map(item => (
                <li key={item.cartItemID}>
                    <span>
                        {item.productName} - Qty: {item.quantity} - R{item.unitPrice}
                    </span>
                    <button onClick={() => updateCartItemQuantity(item.cartItemID, item.quantity + 1)}>+</button>
                    <button 
                        onClick={() => item.quantity > 1 ? updateCartItemQuantity(item.cartItemID, item.quantity - 1) : deleteCartItem(item.cartItemID)}
                    >
                        -
                    </button>
                    <RiDeleteBinLine className="delete-icon" onClick={() => deleteCartItem(item.cartItemID)} />
                </li>
            ))}
        </ul>
        <h4>Total: R{totalAmount}</h4>

        {isBalanceExceeded && (
            <p style={{ color: 'red', fontWeight: 'bold' }}>
                You have exceeded your wallet balance.
            </p>
        )}

        <button
            onClick={handleCheckout}
            disabled={isBalanceExceeded}
            style={{
                backgroundColor: isBalanceExceeded ? '#ccc' : '#4CAF50',
                cursor: isBalanceExceeded ? 'not-allowed' : 'pointer',
                color: isBalanceExceeded ? '#666' : '#fff'
            }}
        >
            <MdOutlineShoppingCartCheckout /> Checkout
        </button>

        <button onClick={toggleCart} className="close-cart">
            Close
        </button>
    </div>
)}
{showOrderSummary && (
  <div className="modal-overlay">
    <div className="modal-content">
      <button className="close-btn" onClick={() => setShowOrderSummary(false)}>×</button>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order, index) => (
            <li key={index}>
              <p><strong>Order #{order.orderID}</strong></p>
              <p>Status: {order.orderStatus}</p>
              <p>Total: R{order.totalAmount}</p>
              <p>Date: {new Date(order.orderDateTime).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
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

      {showFundUserModal && (
        <div className="modal-overlay">
          <FundUser onClose={toggleFundUserModal} />
        </div>
      )}
    </nav>
  );
}

export default Nav;