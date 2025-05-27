import React, { useEffect, useState } from 'react';

function OrderDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="order-display-container">
      <h2>All User Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.orderID}>
              <p><strong>Order #{order.orderID}</strong></p>
              <p>Status: {order.orderStatus}</p>
              <p>Total: R{order.totalAmount}</p>
              <p>Date: {new Date(order.orderDateTime).toLocaleString()}</p>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OrderDisplay;
