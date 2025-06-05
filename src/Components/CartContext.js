// CartContext.js
import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const userId = localStorage.getItem("userId");

  const fetchCartItems = async () => {
    if (!userId) return;

    try {
      const cartResponse = await fetch(`http://localhost:5279/api/cart/user/${userId}`);
      if (!cartResponse.ok) return;

      const cartData = await cartResponse.json();

      const itemsResponse = await fetch(`http://localhost:5279/api/cart/${cartData.cartID}/items`);
      const items = await itemsResponse.json();

      setCartItems(items);

      const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      setTotalAmount(total);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    }
  };

  const addToCart = async (productId, updateProductQuantityUI) => {
    try {
      const cartResponse = await fetch(`http://localhost:5279/api/cart/user/${userId}`);
      let cartData = cartResponse.status === 404 ? await createCart(userId) : await cartResponse.json();

      const requestBody = {
        cartItemID: 0,
        cartID: cartData.cartID,
        productID: productId,
        quantity: 1,
        unitPrice: 0,
        productName: "Product Name", // You can fetch the actual name if needed
      };

      const response = await fetch(`http://localhost:5279/api/cart/${cartData.cartID}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to add item to cart: ${errorData.message || response.statusText}`);
        return;
      }

      if (typeof updateProductQuantityUI === "function") {
        updateProductQuantityUI(productId);
      }

      fetchCartItems();
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

  const createCart = async (userId) => {
    const response = await fetch(`http://localhost:5279/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID: userId }),
    });
    return await response.json();
  };

  const deleteCartItem = async (cartItemID) => {
    await fetch(`http://localhost:5279/api/cart/items/${cartItemID}`, {
      method: "DELETE",
    });
    fetchCartItems();
  };

  const updateCartItemQuantity = async (cartItemID, quantity) => {
    await fetch(`http://localhost:5279/api/cart/items/${cartItemID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    fetchCartItems();
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        addToCart,
        deleteCartItem,
        updateCartItemQuantity,
        fetchCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
