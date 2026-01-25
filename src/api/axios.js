import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
    console.error('CRITICAL: VITE_API_BASE_URL is not defined! Check your .env file or deployment settings.');
}

const api = axios.create({
    baseURL: baseURL || 'http://localhost:3000', // Fallback for local dev only
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
