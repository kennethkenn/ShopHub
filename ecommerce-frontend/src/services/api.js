import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const requestUrl = error.config?.url || '';
            const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

            // Handle specific error codes
            switch (error.response.status) {
                case 401:
                    // Unauthorized on protected routes - clear local auth and redirect once.
                    if (!isAuthRequest) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');

                        if (window.location.pathname !== '/login') {
                            window.location.assign('/login');
                        }
                    }
                    break;
                case 403:
                    // Forbidden - user doesn't have permission
                    break;
                case 404:
                    // Resource not found
                    break;
                case 500:
                    // Server error
                    break;
            }
        }
        return Promise.reject(error);
    }
);

// Dashboard
export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const checkProductPurchase = async (productId) => {
    const response = await api.get(`/orders/check-purchase/${productId}`);
    return response.data;
};

export const submitReview = async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
};

export const getPendingReviews = async (page = 0, size = 20) => {
    const response = await api.get(`/reviews/pending?page=${page}&size=${size}`);
    return response.data;
};

export const approveReview = async (reviewId) => {
    const response = await api.put(`/reviews/${reviewId}/approve`);
    return response.data;
};

export const deleteReview = async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
};

export default api;
