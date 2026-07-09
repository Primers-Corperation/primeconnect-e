import client from './client.js';

export async function getBanks() {
  const { data } = await client.get('/api/wallet/withdraw/banks');
  return data.banks || [];
}

// Resolves an account number to its real holder name — must be shown to
// the user for confirmation before a withdrawal can be submitted.
export async function resolveAccount({ accountNumber, bankCode }) {
  const { data } = await client.post('/api/wallet/withdraw/resolve-account', { accountNumber, bankCode });
  return data.accountName;
}

export async function submitWithdrawal({ amount, accountNumber, bankCode }) {
  const { data } = await client.post('/api/wallet/withdraw', { amount, accountNumber, bankCode });
  return data;
}
