import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load cart based on authenticated user (using cookies)
    useEffect(() => {
        const loadUserAndCart = async () => {
            try {
                // Check if user is authenticated via cookies
                const userRes = await api.get('/api/auth/me');
                const uid = userRes.data.id;
                setUserId(uid);
                
                // Load user's cart from localStorage
                const savedCart = localStorage.getItem(`cart_${uid}`);
                setCartItems(savedCart ? JSON.parse(savedCart) : []);
            } catch (error) {
                // Not authenticated - clear cart
                setUserId(null);
                setCartItems([]);
            }
            setLoading(false);
        };
        
        loadUserAndCart();
        
        // Listen for auth logout events
        const handleLogout = () => {
            setCartItems([]);
            setUserId(null);
        };
        window.addEventListener('auth:logout', handleLogout);
        
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    // Save cart whenever it changes
    useEffect(() => {
        if (userId) {
            localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
        }
    }, [cartItems, userId]);

    const addToCart = (item, restaurant) => {
        setCartItems(prev => {
            // Check if items from different restaurant
            if (prev.length > 0 && prev[0].restaurant?.id !== restaurant.id) {
                if (!window.confirm("Items from another restaurant already in cart. Clear cart and add this?")) {
                    return prev;
                }
                return [{ ...item, quantity: 1, restaurant }];
            }
            
            // Check if item already exists
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1, restaurant }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId, delta) => {
        setCartItems(prev =>
            prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
                .filter(i => i.quantity > 0)
        );
    };

    const clearCart = () => setCartItems([]);

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart, 
            cartTotal, 
            cartCount,
            loading 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);