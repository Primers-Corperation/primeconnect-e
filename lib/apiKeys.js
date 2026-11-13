// Primers API keys ("Authorization: Bearer prm_live_..."), so other developers can use PrimeConnect
// from their own servers. Keys are created at id.primersgroup.ng/developers/keys and checked with
// Primers ID, which answers with the owner's PrimeConnect account number and the key's permissions.
// PrimeConnect authenticates itself with its own Primers ID client secret (PRIMERS_ID_CLIENT_SECRET).
// Answers are cached for a minute by a hash of the key, never the key itself.
import crypto from 'node:crypto';
import { PRIMERS_CLIENT_ID } from './primersId.js';

const VERIFY_URL = process.env.PRIMERS_KEYS_URL || 'https://id.primersgroup.ng/api/keys/verify';
const KEY_RE = /^prm_(live|test)_[A-Za-z0-9]{20,64}$/;
const TTL = 60 * 1000;
const cache = new Map();

export const looksLikeKey = (t) => typeof t === 'string' && t.startsWith('prm_');

export async function checkKey(key, fetchImpl = fetch) {
  if (!KEY_RE.test(key)) return { active: false };
  const secret = process.env.PRIMERS_ID_CLIENT_SECRET;
  if (!secret) return { active: false, unavailable: true };
  const id = crypto.createHash('sha256').update(key).digest('hex');
  const hit = cache.get(id);
  if (hit && hit.at > Date.now() - TTL) return hit.value;
  let value;
  try {
    const res = await fetchImpl(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Basic ' + Buffer.from(`${PRIMERS_CLIENT_ID}:${secret}`).toString('base64') },
      body: JSON.stringify({ key }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) { console.error('Primers API key check failed with status', res.status); return { active: false, unavailable: true }; }
    value = await res.json();
  } catch (err) {
    console.error('Primers API key check unreachable:', err.message);
    return { active: false, unavailable: true };
  }
  if (cache.size > 5000) cache.clear();
  cache.set(id, { at: Date.now(), value });
  return value;
}

// What a key may do here. Money movement (top-ups, withdrawals, account purchases) and support
// tickets are never reachable with a key; they need the person signed in.
export function allowedForKey(method, path, scopes) {
  const has = (s) => scopes.includes(s);
  const read = method === 'GET' || method === 'HEAD';
  if (path === '/api/sms/send') return method === 'POST' && has('primeconnect.sms');
  if (path === '/api/sms/getNumber' || /^\/api\/sms\/activations\/[^/]+\/cancel$/.test(path)) return method === 'POST' && has('primeconnect.numbers');
  if (path.startsWith('/api/sms/')) return read && (has('primeconnect.numbers') || has('primeconnect.sms'));
  if (path === '/api/wallet' || path === '/api/wallet/') return read && (has('primeconnect.numbers') || has('primeconnect.sms'));
  return false;
}
