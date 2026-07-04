import client from './client.js';

export async function getBalance(userId) {
  const { data } = await client.get(`/api/wallet/balance/${userId}`);
  return data.balance;
}
