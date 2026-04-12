import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// REQUEST INTERCEPTOR: Inject Token from LocalStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// RESPONSE INTERCEPTOR: Handle Token Expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If 401 and it's NOT the refresh endpoint itself
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth/refresh')) {
            originalRequest._retry = true;
            
            try {
                const refreshResponse = await api.post('/api/auth/refresh');
                if (refreshResponse.data.token) {
                    localStorage.setItem('token', refreshResponse.data.token);
                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh genuinely fails, don't wipe everything immediately 
                // to avoid flickering loading screens, but the app will handle it
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;