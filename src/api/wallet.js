import api from './axios';

export const getWalletBalance = async (userId) => {
    const response = await api.get(`/api/wallet/balance/${userId}`);
    return response.data;
};
