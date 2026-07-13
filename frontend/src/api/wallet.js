import client from './client.js';

const CACHE_KEY = 'pc_wallet_cache';

function classifyError(err) {
  if (!err.response) return 'network';
  const s = err.response.status;
  if (s === 401) return 'auth';
  if (s === 403) return 'forbidden';
  if (s === 404) return 'not_found';
  return 'server';
}

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}

// Full wallet: balance + transaction ledger for the logged-in user.
export async function getWallet() {
  try {
    const { data } = await client.get('/api/wallet');
    const result = { balance: data.balance, transactions: data.transactions || [] };
    setCache(result);
    return result;
  } catch (err) {
    const kind = classifyError(err);
    if (kind === 'network' || kind === 'not_found') {
      return getCached() || { balance: 0, transactions: [] };
    }
    throw err;
  }
}

export async function getBalance(userId) {
  try {
    const { data } = await client.get(`/api/wallet/balance/${userId}`);
    return data.balance;
  } catch (err) {
    const kind = classifyError(err);
    if (kind === 'network' || kind === 'not_found') {
      const cached = getCached();
      return cached ? cached.balance : 0;
    }
    throw err;
  }
}

// Start a Paystack top-up; returns the hosted-checkout URL to redirect to.
export async function initializeTopup(amount) {
  const { data } = await client.post('/api/wallet/paystack/initialize', { amount });
  return data;
}

// Preview the fee cushion for a desired wallet credit before committing.
export async function quoteTopup(amount) {
  const { data } = await client.get('/api/wallet/paystack/quote', { params: { amount } });
  return data.chargedAmount;
}

// Verify a top-up after returning from Paystack checkout.
export async function verifyTopup(reference) {
  const { data } = await client.get(`/api/wallet/paystack/verify/${reference}`);
  return data;
}
