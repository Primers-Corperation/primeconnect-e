import api from './axios';

export const getNumber = async (data) => {
    const response = await api.post('/api/sms/getNumber', data);
    return response.data;
};
