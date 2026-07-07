import axios from 'axios';

// Thin wrapper around the Paystack REST API. The secret key is read lazily
// per-request so a missing env var surfaces as a clear runtime error rather
// than crashing at import time.
const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
});

function authHeader() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set');
  return { Authorization: `Bearer ${key}` };
}

export async function initializeTransaction({ email, amountKobo, reference, callbackUrl }) {
  const { data } = await paystack.post(
    '/transaction/initialize',
    { email, amount: amountKobo, reference, callback_url: callbackUrl },
    { headers: authHeader() }
  );
  return data.data; // { authorization_url, access_code, reference }
}

export async function verifyTransaction(reference) {
  const { data } = await paystack.get(`/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: authHeader(),
  });
  return data.data; // { status, amount, reference, channel, ... }
}

// ---- Transfers (payouts) — a separate API from the Checkout API above ----

export async function listBanks() {
  const { data } = await paystack.get('/bank', {
    params: { country: 'nigeria', currency: 'NGN' },
    headers: authHeader(),
  });
  return data.data; // [{ name, code, ... }]
}

// Never trust a client-supplied account name — this is the source of truth.
export async function resolveAccount(accountNumber, bankCode) {
  const { data } = await paystack.get('/bank/resolve', {
    params: { account_number: accountNumber, bank_code: bankCode },
    headers: authHeader(),
  });
  return data.data; // { account_number, account_name, bank_id }
}

export async function createTransferRecipient({ name, accountNumber, bankCode }) {
  const { data } = await paystack.post(
    '/transferrecipient',
    { type: 'nuban', name, account_number: accountNumber, bank_code: bankCode, currency: 'NGN' },
    { headers: authHeader() }
  );
  return data.data; // { recipient_code, ... }
}

export async function initiateTransfer({ amountKobo, recipientCode, reason, reference }) {
  const { data } = await paystack.post(
    '/transfer',
    { source: 'balance', amount: amountKobo, recipient: recipientCode, reason, reference },
    { headers: authHeader() }
  );
  return data.data; // { status: 'pending' | 'otp' | ..., transfer_code, reference, ... }
}
