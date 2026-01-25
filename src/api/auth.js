import api from './axios';

export const loginUser = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
};

// Register endpoint if needed, but Login is priority
export const registerUser = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
};
