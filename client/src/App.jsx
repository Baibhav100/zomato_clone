import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import SupportChat from './components/SupportChat';

import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';

import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import OrderDetail from './pages/OrderDetail';

import api from './api';

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // ✅ First check if we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('[AUTH] No token found, skipping session restore');
          setLoading(false);
          return;
        }

        // ✅ Try to get user data
        const res = await api.get('/api/auth/me');
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        console.log('[AUTH] Session restored successfully');
      } catch (err) {
        console.error('[AUTH] Failed to restore session:', err.response?.data || err.message);
        
        // ✅ If session restore fails, clear everything
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // ✅ Don't redirect, just clear state
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Listen for forced logout from the token-refresh interceptor
    const handleLogout = () => {
      console.log('[AUTH] Logout event received');
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    };
    
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-zomato-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Router>
      <CartProvider>
        <div className="app min-h-screen bg-white">
          <Header 
            user={user} 
            setUser={(userData) => { 
              setUser(userData); 
              if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
              } else {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
              }
            }} 
          />
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Redirect standalone login/signup to home — auth handled by the modal overlay */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            <Route path="/dine-out" element={<Home initialTab="dine_out" />} />
            <Route path="/nightlife" element={<Home initialTab="nightlife" />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/checkout" element={
              <ProtectedRoute user={user}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute user={user}>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute user={user}>
                <OrderDetail />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute user={user}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute user={user} requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
          <Footer />
          <SupportChat />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;