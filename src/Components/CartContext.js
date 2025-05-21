import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    const addToCart = (item) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.productID === item.productID);
            if (existingItem) {
                return prevItems.map((i) =>
                    i.productID === item.productID ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
        setTotalAmount((prevAmount) => prevAmount + item.unitPrice);
    };

    const deleteCartItem = (cartItemId) => {
        setCartItems((prevItems) => prevItems.filter(item => item.cartItemID !== cartItemId));
        // Optionally update totalAmount here
    };

    return (
        <CartContext.Provider value={{ cartItems, totalAmount, addToCart, deleteCartItem }}>
            {children}
        </CartContext.Provider>
    );
};