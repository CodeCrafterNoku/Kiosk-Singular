import React, { useRef, useState, useEffect } from 'react';
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
import Confetti from 'react-confetti';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineCheck } from 'react-icons/ai';
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
  const [showFundModal, setShowFundModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const dropdownRef = useRef();
  const drawerRef = useRef(null);  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  

useEffect(() => {
  const handleClickOutside = (event) => {
    if (drawerRef.current && !drawerRef.current.contains(event.target)) {
      setDrawerOpen(false);  // Close drawer
    }
  };

  if (drawerOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [drawerOpen]);

//NEW CHANGES
const handleFundClick = () => {
    setShowConfirmation(true); // Show confirmation when Fund is clicked
};

const confirmFund = () => {
    addFunds(); // Proceed with the fund process
    setShowConfirmation(false); // Close confirmation popup
};

const cancelFund = () => {
    setShowConfirmation(false); // Close confirmation popup
};
//END NEW CHANGES
  
useEffect(() => {
    const handleResize = () => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight); // Ensure this is included
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);


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
  const toggleFundModal = () => {
  setShowFundModal((prev) => !prev);
};

const closeFundModal = () => {
  setShowFundModal(false);
  setFundAmount(''); // Clear the input after closing
};



const addFunds = async () => {
    const userId = localStorage.getItem("userId");
    const amountToAdd = Number(fundAmount);

    if (!fundAmount || isNaN(amountToAdd) || amountToAdd <= 0) {
        toast.error("Please enter a valid amount greater than zero", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeButton: false,
        });
        return;
    }

    const requestBody = {
        walletID: walletID,
        userID: userId,
        balance: amountToAdd,
        lastUpdated: new Date().toISOString(),
        userName: "Sinethemba"
    };

    setLoading(true); // Start loading before the API call
    try {
        const response = await fetch('http://localhost:5279/api/wallet/addfunds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(`Failed to add funds: ${errorData.message || response.statusText}`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
            return;
        }

        const data = await response.json();
        setWalletBalance(prevBalance => (Number(data.newBalance)).toFixed(2));
        setFundAmount('');
        setShowConfetti(true);

        toast.dismiss();
        const successToast = toast.success(`Successfully funded wallet with R${amountToAdd}`, {
            position: "top-right",
            autoClose: false, // Prevent auto close
            hideProgressBar: false,
            closeButton: false,
        });

        setTimeout(() => {
            setShowConfetti(false);
            toast.dismiss(successToast); // Dismiss the toast
            setLoading(false); // End loading
            closeFundModal();
        }, 3000);
    } catch (error) {
        console.error('Error adding funds:', error);
        toast.error('An error occurred while adding funds.', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
        });
    } finally {
        setLoading(false); // Ensure loading state is set to false
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
        
        toast.success(
          <span>
            <AiOutlineCheck /> Item deleted successfully!
          </span>,
          {
            position: "top-center",
            autoClose: 1500,
            hideProgressBar: true,
            closeButton: false,
          }
        );

        
    } catch (error) {
        console.error('Delete error:', error);
        setError(error.message);
        toast.error(`Error: ${error.message}`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeButton: false,
        });
    } finally {
        setIsLoading(false);
    }
};

const cartID = localStorage.getItem("cartID");
const walletID = localStorage.getItem("walletID");

const handleCheckout = async () => {
    const userId = localStorage.getItem("userId");

    if (cartItems.length === 0) {
        toast.error("Cart is empty. Please add items to your cart before checking out.", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeButton: false,
        });
        return;
    }

    const subtotal = cartItems.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
    const deliveryFee = selectedDeliveryMethod === "Delivery" ? 10 : 0;
    const totalAmount = subtotal + deliveryFee;

    const checkoutData = {
        UserID: Number(userId),
        DeliveryMethod: selectedDeliveryMethod,
        Subtotal: subtotal,
        DeliveryFee: deliveryFee,
        TotalAmount: totalAmount,
        OrderStatus: "Pending",
        OrderDateTime: new Date(),
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
            console.error('Checkout failed:', errorText);
            toast.error(`Checkout failed: ${errorText}`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeButton: false,
            });
            return;
        }

        const orderResponse = await response.json();
        localStorage.setItem("orderID", orderResponse.orderID);
        toast.success("Checkout successful!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeButton: false,
        });

        // Create order items quietly
        await Promise.all(cartItems.map(async (item) => {
            const orderItemDto = {
                OrderID: orderResponse.orderID,
                ProductID: item.productID,
                Quantity: item.quantity,
                UnitPrice: item.unitPrice,
                TotalPrice: (item.unitPrice * item.quantity).toFixed(2),
            };

            try {
                const orderItemResponse = await fetch('http://localhost:5279/api/orderitem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderItemDto),
                });

                // Suppress error handling for order items
                if (!orderItemResponse.ok) {
                    const errorData = await orderItemResponse.text();
                    console.error('Failed to create order item:', errorData);
                }
            } catch (error) {
                console.error('Error creating order item:', error);
            }
        }));

        // Clear the cart
        setCartItems([]);
        setTotalAmount(0);
        
        // Create transaction and update wallet balance
        const transactionResult = await createTransaction(totalAmount);
        if (transactionResult) {
            // Only update local balance if transaction was successful
            await fetchUpdatedWalletBalance();
        }

    } catch (error) {
        console.error('Checkout error:', error);
        toast.error(`An error occurred during checkout: ${error.message}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeButton: false,
        });
    }
};
// Refetch updated wallet balance after checkout
fetch(`http://localhost:5279/api/wallet/user/${userId}`)
  .then(res => res.json())
  .then(data => {
    setWalletBalance(Number(data.balance).toFixed(2));
  })
  .catch(err => console.error("Failed to refresh wallet after checkout:", err));

// Fetch updated wallet balance
const fetchUpdatedWalletBalance = async () => {
    try {
        const walletResponse = await fetch(`http://localhost:5279/api/wallet/${walletID}`);
        if (walletResponse.ok) {
            const walletData = await walletResponse.json();
            setWalletBalance(walletData.balance.toFixed(2));
        } else {
            console.error('Failed to fetch updated wallet balance');
        }
    } catch (error) {
        console.error('Error fetching updated wallet balance:', error);
    }
};
localStorage.setItem("userId", userId);
localStorage.setItem("walletID", walletID);

// Transaction creation function - updated
const createTransaction = async (totalAmount) => {
    const userId = localStorage.getItem("userId");
    const orderID = localStorage.getItem("orderID");

    // Validate userId and orderID
    if (!userId || !orderID || orderID === "0") {
        console.error("Invalid userId or orderID");
        return false;
    }

    // Fetch wallet info dynamically for the current user
    try {
        const walletResponse = await fetch(`http://localhost:5279/api/Wallet/user/${userId}`);
        if (!walletResponse.ok) {
            console.error("Failed to get wallet info");
            return false;
        }
        const walletData = await walletResponse.json();
        const walletID = walletData.walletID;

        if (!walletID || walletID === 0) {
            console.error("Invalid walletID from API");
            return false;
        }

        const transactionData = {
            transactionID: 0,
            walletID: Number(walletID),
            amount: totalAmount,
            orderID: Number(orderID),
            paymentMethod: 'EFT',
            paymentDateTime: new Date().toISOString(),
            paymentStatus: 'Completed'
        };

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
            return true;
        } else {
            // Handle error responses
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                console.error(`Transaction failed: ${errorData.message || response.statusText}`);
                toast.error(`Transaction failed: ${errorData.message || "Payment could not be processed"}`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeButton: false,
                });
            } else {
                const errorText = await response.text();
                console.error(`Transaction failed: ${errorText || response.statusText}`);
                toast.error(`Transaction failed: ${errorText || "Payment could not be processed"}`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeButton: false,
                });
            }
            return false;
        }
    } catch (error) {
        console.error('Transaction error:', error);
        toast.error(`Transaction error: ${error.message}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeButton: false,
        });
        return false;
    }
};

 const handleMenuItemClick = (action) => {
        setDrawerOpen(false); // Close the drawer
        if (action === 'View Orders') {
            fetchOrdersByUser(userId); // Fetch user orders
            setShowOrderSummary(true); // Show the order modal
        } else if (action === 'Logout') {
            navigate('/'); // Navigate to home or login
        } else if (action === 'Account Settings') {
            navigate('/user/account-settings'); // Navigate to Account Settings
        }
    };





  const toggleFundUserModal = () => {
    setShowFundUserModal(!showFundUserModal);
  };
  

  // Check if the user is an Admin
  const userRole = localStorage.getItem("roleID");

 const updateCartItemQuantity = async (cartItemId, newQuantity) => {
    const userId = localStorage.getItem("userId");
    
    const requestBody = {
        quantity: newQuantity,
    };

    try {
        const response = await fetch(`http://localhost:5279/api/cart/cartitem/${cartItemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            setErrorMessage(errorData.message || 'Oops! This product is currently out of stock. Please check back later.');
            return;
        }

        setErrorMessage(''); // Clear error message on success
        fetchCartByUser(userId);
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        setErrorMessage('Oops! This product is currently out of stock. Please check back later.');
    }
};

    // Fetch user orders function
    const fetchOrdersByUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5279/api/Order/user/${userId}/with-items`);
            if (!response.ok) throw new Error("Failed to fetch orders");

            const ordersData = await response.json();
            setOrders(ordersData); // Set the orders in state for display
        } catch (error) {
            console.error("Error fetching user orders:", error);
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
                   {userRole === '8' ? (
            <Link to="/admin/products" className="home-icon" aria-label="Home">
                <AiFillHome className="nav-icons" />
            </Link>
        ) : (
            <Link to="/user/products" className="home-icon" aria-label="Home">
                <AiFillHome className="nav-icons" />
            </Link>
        )}


            {/* Check if userRole is correct */}
            {console.log("User Role:", userRole)}

            {/* Conditionally render the notification icon for admin users only */}
            {userRole === '8' && (
                <Link to="/orders" className="notification-icon">
                    <HiBellAlert className="nav-icons" />
                </Link>
            )}

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
                <div className="wallet-dropdown" ref={dropdownRef}>
                    <button onClick={toggleFundModal}>Fund Your Wallet</button>

                    {/* Conditionally render the Fund User button */}
                    {userRole === '8' && (
                        <button onClick={toggleFundUserModal}>Fund User</button>
                    )}
                    


                </div>
            )}

            <a href="#" className="menu-icon" onClick={toggleDrawer}>
                <FiMenu className="nav-icons" />
            </a>
        </div>
        {showFundModal && (
    <div className="modal-overlay">
        <div className="modal-content">
            {showConfetti && <Confetti width={windowWidth} height={windowHeight} />}
            <h2>Fund Your Wallet</h2>
            <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="input-container" // Add this class for styling
            />
            <button className="action-button" onClick={handleFundClick}>Fund</button>

            {/* Confirmation Section */}
            {showConfirmation && (
                <div className="confirmation-popup">
                    <div className="confirmation-box">
                        <p>Are you sure you want to fund your wallet with R{fundAmount}?</p>
                        <button className="action-button" onClick={confirmFund}>Yes</button>
                        <button className="action-button close" onClick={cancelFund}>No</button>
                    </div>
                </div>
            )}
            <button className="close" onClick={closeFundModal}>Close</button>
        </div>
    </div>
)}
<ToastContainer />

        <ToastContainer />
        {showCart && (
          <div class="modal-overlay">
            <div className="cart-popup">
                <h3>Cart Items</h3>

                {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                )}

                <ul>
                    {cartItems.map(item => (
                        <li key={item.cartItemID}>
                            <span>
                                {item.productName} - Qty: {item.quantity} - R{item.unitPrice}
                            </span>
                            <button onClick={() => updateCartItemQuantity(item.cartItemID, item.quantity + 1)}>+</button>
                              <button 
                                  className="decrease-button"
                                  onClick={() => item.quantity > 1 ? updateCartItemQuantity(item.cartItemID, item.quantity - 1) : deleteCartItem(item.cartItemID)}
                              >
                                  -
                              </button>
                            <RiDeleteBinLine className="delete-icon" onClick={() => deleteCartItem(item.cartItemID)} />
                        </li>
                    ))}
                </ul>
                <h4>Total: R{totalAmount}</h4>
                <div>
                    <h3>Select Delivery Method</h3>
                    <label>
                      <input
                        type="radio"
                        value="Pickup"
                        checked={selectedDeliveryMethod === "Pickup"}
                        onChange={() => setSelectedDeliveryMethod("Pickup")}
                      />
                      Pickup
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="Delivery"
                        checked={selectedDeliveryMethod === "Delivery"}
                        onChange={() => setSelectedDeliveryMethod("Delivery")}
                      />
                      Delivery
                    </label>
                  </div>
                        {isBalanceExceeded && (
                          <>
                            <p style={{ color: 'red', fontWeight: '400' }}>
                                You have exceeded your wallet balance.
                            </p>
                              <button onClick={() => {
                              setShowFundModal(true);   // ✅ opens modal directly
                              setShowCart(false);       // ✅ closes cart if needed
                            }}>
                              Fund Your Wallet
                            </button>
                          </>
                        )}
                
                <div className="cart-popup-buttons">
                  <button
                    onClick={handleCheckout}
                    disabled={isBalanceExceeded}
                    className={`checkout-button ${isBalanceExceeded ? 'disabled' : ''}`}
                  >
                    <MdOutlineShoppingCartCheckout /> Checkout
                  </button>

                  <button onClick={toggleCart} className="close-cart">
                    Close
                  </button>
                </div>
            </div>
            </div>
)}
{showOrderSummary && (
  <div className="order-summary-modal-overlay">
    <div className="order-summary-modal-content">
      <button className=".order-summary-close-btn" onClick={() => setShowOrderSummary(false)}>×</button>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="order-summary-order-list">
          {orders
            .sort((a, b) => new Date(b.orderDateTime) - new Date(a.orderDateTime)) // Sort by date
            .map((order) => (
              <li key={order.orderID} className="order-summary-order-item">
                <p><strong>Order #{order.orderID}</strong></p>
                <p>Status: <span className={`status ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></p>
                <p>Total: R{order.totalAmount.toFixed(2)}</p>
                <p>Date: {new Date(order.orderDateTime).toLocaleString()}</p>
                <h4>Items:</h4>
                <ul className="order-summary-item-list">
                  {order.orderItems.map(item => (
                    <li key={item.orderItemID} className="item">
                      {item.quantity} x {item.productName} @ R{item.unitPrice.toFixed(2)} (Total: R{item.totalPrice.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </li>
            ))}
        </ul>
      )}
    </div>
  </div>
)}


{drawerOpen && (
  <div className={`drawer ${drawerOpen ? 'open' : ''}`} ref={drawerRef}>
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