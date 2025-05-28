import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            fetchCartByUser(userId);
        }
    }, []);

    const fetchCartByUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5279/api/cart/user/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch cart");

            const cartData = await response.json();
            setCartItems(cartData.cartItems);
            setTotalAmount(cartData.totalAmount);
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    const addToCart = (product) => {
        const existingItem = cartItems.find(item => item.productID === product.productID);
        if (existingItem) {
            setCartItems(cartItems.map(item =>
                item.productID === product.productID
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCartItems([...cartItems, { ...product, quantity: 1 }]);
        }
        setTotalAmount(prev => prev + product.price);
    };

    return (
        <CartContext.Provider value={{ cartItems, totalAmount, setCartItems, setTotalAmount, addToCart }}>
            {children}
        </CartContext.Provider>
    );
};