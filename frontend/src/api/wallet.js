import client from './client.js';

// Full wallet: balance + transaction ledger for the logged-in user.
export async function getWallet() {
  const { data } = await client.get('/api/wallet');
  return { balance: data.balance, transactions: data.transactions || [] };
}

export async function getBalance(userId) {
  const { data } = await client.get(`/api/wallet/balance/${userId}`);
  return data.balance;
}

// Start a Paystack top-up; returns the hosted-checkout URL to redirect to.
export async function initializeTopup(amount) {
  const { data } = await client.post('/api/wallet/paystack/initialize', { amount });
  return data; // { status, authorization_url, reference, amount, chargedAmount }
}

// Preview the fee cushion for a desired wallet credit before committing.
export async function quoteTopup(amount) {
  const { data } = await client.get('/api/wallet/paystack/quote', { params: { amount } });
  return data.chargedAmount;
}

// Verify a top-up after returning from Paystack checkout.
export async function verifyTopup(reference) {
  const { data } = await client.get(`/api/wallet/paystack/verify/${reference}`);
  return data; // { status, balance } | { status: 'pending' }
}
