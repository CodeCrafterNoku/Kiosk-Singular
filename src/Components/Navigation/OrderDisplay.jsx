import React, { useEffect, useState } from 'react';
import './OrderDisplay.css';

function OrderDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrderID, setEditingOrderID] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5279/api/Order', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) throw new Error("Failed to fetch orders");

        const ordersData = await response.json();
        setOrders(ordersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleEdit = (orderID) => {
    // Logic for editing the order
    setEditingOrderID(orderID);
    // You can implement further logic here
  };

  const handleCancel = () => {
    setEditingOrderID(null); // Reset edit state
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="order-display-container">
      <h2>All Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order) => (
<li key={order.orderID}>
  <div className="order-item-content">
    <div className="order-details">
      <p><strong>Order #{order.orderID}</strong></p>
      <p>Status: {order.orderStatus}</p>
      <p>Total: R{order.totalAmount}</p>
      <p>Date: {new Date(order.orderDateTime).toLocaleString()}</p>
    </div>
    <div className="card-buttons">
      <button className="button">Edit</button>
 
    </div>
  </div>
</li>

          ))}
        </ul>
      )}
    </div>
  );
}

export default OrderDisplay;