import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

import { hashResetToken } from '../routes/auth.js';

test('hashResetToken is deterministic and returns a sha256 hex digest', () => {
  const token = 'a'.repeat(64);
  const hash = hashResetToken(token);
  assert.equal(hash, crypto.createHash('sha256').update(token).digest('hex'));
  assert.equal(hash.length, 64);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hashResetToken(token), hash);
});

test('hashResetToken produces different digests for different tokens', () => {
  assert.notEqual(hashResetToken('token-one'), hashResetToken('token-two'));
});
