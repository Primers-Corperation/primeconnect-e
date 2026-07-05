import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('pc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new Event('pc:unauthorized'));
    }
    return Promise.reject(err);
  }
);

export default client;
