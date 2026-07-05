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
