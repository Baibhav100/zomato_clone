import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/api/auth/me');
        setIsAuthenticated(true);
        setUserRole(response.data.role);
      } catch (error) {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };
    
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && userRole !== 'admin') {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h3 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h3>
        <p className="text-gray-600 mb-8">You do not have permission to view the Admin Dashboard.</p>
        <button 
            onClick={() => window.location.href = '/'} 
            className="px-8 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return children;
};


export default ProtectedRoute;