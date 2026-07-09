import client from './client.js';

export async function login(email, password) {
  // Mock implementation: accept any credentials and return a static token and user
  return {
    token: 'mock-token-12345',
    user: { id: 'mock-user', name: 'Test User', email }
  };
}

export async function register(name, email, password) {
  // Mock implementation: ignore input and return a static token and user
  return {
    token: 'mock-token-12345',
    user: { id: 'mock-user', name, email }
  };
}

// Update the current user's profile. `payload` may include name, email,
// currentPassword and newPassword.
export async function updateProfile(payload) {
  const { data } = await client.put('/api/auth/me', payload);
  return data.user;
}
