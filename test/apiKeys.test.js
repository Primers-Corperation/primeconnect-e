import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowedForKey, checkKey, looksLikeKey } from '../lib/apiKeys.js';

test('keys reach SMS and numbers only within their permissions', () => {
  assert.equal(allowedForKey('POST', '/api/sms/send', ['primeconnect.sms']), true);
  assert.equal(allowedForKey('POST', '/api/sms/send', ['primeconnect.numbers']), false);
  assert.equal(allowedForKey('POST', '/api/sms/getNumber', ['primeconnect.numbers']), true);
  assert.equal(allowedForKey('POST', '/api/sms/activations/abc/cancel', ['primeconnect.numbers']), true);
  assert.equal(allowedForKey('GET', '/api/sms/activations', ['primeconnect.sms']), true);
  assert.equal(allowedForKey('GET', '/api/wallet', ['primeconnect.sms']), true);
});
test('money movement and support are never reachable with a key', () => {
  const all = ['primeconnect.sms', 'primeconnect.numbers', 'store.publish'];
  for (const [m, p] of [['POST', '/api/wallet/paystack/initialize'], ['POST', '/api/wallet/withdraw'], ['POST', '/api/accounts/purchase'], ['POST', '/api/support'], ['GET', '/api/wallet/balance/x'], ['POST', '/api/auth/login']]) {
    assert.equal(allowedForKey(m, p, all), false, `${m} ${p}`);
  }
});
test('malformed keys never reach Primers ID', async () => {
  let called = false;
  assert.equal(looksLikeKey('prm_live_x'), true);
  assert.deepEqual(await checkKey('prm_live_short', () => { called = true; }), { active: false });
  assert.equal(called, false);
});
