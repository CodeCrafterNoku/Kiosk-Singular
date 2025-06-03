import React, { useEffect, useState } from 'react';
import './OrderDisplay.css';

function OrderDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrderID, setEditingOrderID] = useState(null);
  const [products, setProducts] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of orders per page

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5279/api/Order/with-items');
        if (!response.ok) throw new Error("Failed to fetch orders");

        const ordersData = await response.json();
        setOrders(ordersData);
        await fetchProductNames(ordersData.flatMap(order => order.orderItems.map(item => item.productID)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchProductNames = async (productIDs) => {
      try {
        const uniqueProductIDs = [...new Set(productIDs)];
        const productPromises = uniqueProductIDs.map(id =>
          fetch(`http://localhost:5279/api/Product/${id}`)
        );

        const responses = await Promise.all(productPromises);
        const productsData = await Promise.all(responses.map(res => res.ok ? res.json() : null));

        const productsMap = productsData.reduce((acc, product) => {
          if (product) {
            acc[product.productID] = product.productName; // Use correct property name
          }
          return acc;
        }, {});

        setProducts(productsMap);
      } catch (err) {
        console.error("Failed to fetch product names:", err);
      }
    };

    fetchOrders();
  }, []);

  const handleEdit = (orderID) => {
    setEditingOrderID(orderID);
  };

  const handleCancel = () => {
    setEditingOrderID(null);
  };

  const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDateTime) - new Date(a.orderDateTime));

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentOrders = sortedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="order-display-container">
      <h2>All Orders</h2>
      {currentOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {currentOrders.map((order) => (
            <li key={order.orderID}>
              <div className="order-item-content">
                <div className="order-details">
                  <p><strong>Order #{order.orderID}</strong></p>
                  <p>Status: {order.orderStatus}</p>
                  <p>Total: R{order.totalAmount}</p>
                  <p>Date: {new Date(order.orderDateTime).toLocaleString()}</p>
                  <h4>Items:</h4>
                  <ul>
                    {order.orderItems.map(item => (
                      <li key={item.productID}>
                        {item.quantity} x {products[item.productID] || 'Loading...'} @ R{item.unitPrice} (Total: R{item.totalPrice})
                      </li>
                    ))}
                  </ul>
                </div>
                {/* <div className="card-buttons">
                  <button className="button" onClick={() => handleEdit(order.orderID)}>Edit</button>
                </div> */}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
          className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default OrderDisplay;