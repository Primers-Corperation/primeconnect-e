import client from './client.js';

// Marketplace accounts currently available to buy.
export async function getAvailableAccounts() {
  const { data } = await client.get('/api/accounts/available');
  return data.accounts || [];
}

export async function purchaseAccount(accountId) {
  const { data } = await client.post('/api/accounts/purchase', { accountId });
  return data.account;
}
