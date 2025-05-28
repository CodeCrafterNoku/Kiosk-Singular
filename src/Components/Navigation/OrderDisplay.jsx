import React, { useEffect, useState } from 'react';
import './OrderDisplay.css';

function OrderDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrderID, setEditingOrderID] = useState(null);
  const [products, setProducts] = useState({}); // Store product names

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5279/api/Order/with-items', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) throw new Error("Failed to fetch orders");

        const ordersData = await response.json();
        setOrders(ordersData);

        // Fetch product names based on unique product IDs from orders
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
        const productsData = await Promise.all(responses.map(async (res) => {
          if (!res.ok) {
            console.error(`Failed to fetch product: ${res.statusText}`);
            return null; // Handle failed fetch
          }
          return await res.json();
        }));

        const productsMap = productsData.reduce((acc, product) => {
          if (product) {
            acc[product.productID] = product.name; // Store product name
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
    setEditingOrderID(null); // Reset edit state
  };

  // Sort orders by orderDateTime in descending order
  const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDateTime) - new Date(a.orderDateTime));

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="order-display-container">
      <h2>All Orders</h2>
      {sortedOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {sortedOrders.map((order) => (
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
                <div className="card-buttons">
                  <button className="button" onClick={() => handleEdit(order.orderID)}>Edit</button>
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