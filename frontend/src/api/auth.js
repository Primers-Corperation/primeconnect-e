import client from './client.js';

export async function login(email, password) {
  const { data } = await client.post('/api/auth/login', { email, password });
  return data;
}

export async function register(name, email, password) {
  const { data } = await client.post('/api/auth/register', { name, email, password });
  return data;
}
