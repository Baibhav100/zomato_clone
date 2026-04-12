import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,  // CRITICAL: This sends cookies with every request
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor - for logging and adding any request-specific headers
api.interceptors.request.use(
    (config) => {
        // Log requests in development
        if (import.meta.env.DEV) {
            console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
        }
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - for handling errors globally
api.interceptors.response.use(
    (response) => {
        // Log responses in development
        if (import.meta.env.DEV) {
            console.log('✅ API Response:', response.config.url, response.status);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token using the refresh token cookie
                await api.post('/api/auth/refresh');
                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - user needs to login again
                console.error('Refresh token failed:', refreshError);
                
                // Clear user data
                localStorage.removeItem('user');
                
                // Dispatch logout event
                window.dispatchEvent(new Event('auth:logout'));
                
                // Don't auto-redirect, just reject
                return Promise.reject(refreshError);
            }
        }
        
        // Handle other errors
        if (error.response?.status === 403) {
            console.error('Access Denied:', error.response.data?.error);
        }
        
        if (error.response?.status === 500) {
            console.error('Server Error:', error.response.data?.error);
        }
        
        if (error.code === 'ECONNABORTED') {
            console.error('Request Timeout:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;