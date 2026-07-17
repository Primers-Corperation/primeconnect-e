import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  registerSchema,
  loginSchema,
  smsSendSchema,
  walletTopupSchema,
  accountPurchaseSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
} from '../middleware/validation.js';

test('registerSchema accepts valid input and rejects bad input', () => {
  assert.equal(
    registerSchema.safeParse({ name: 'Ada', email: 'ada@example.com', password: 'secret123' }).success,
    true
  );
  assert.equal(registerSchema.safeParse({ name: 'Ada', email: 'ada@example.com', password: '123' }).success, false);
  assert.equal(registerSchema.safeParse({ name: 'Ada', email: 'bad', password: 'secret123' }).success, false);
});

test('loginSchema requires an email and a non-empty password', () => {
  assert.equal(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success, true);
  assert.equal(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success, false);
});

test('walletTopupSchema requires a positive number', () => {
  assert.equal(walletTopupSchema.safeParse({ amount: 100 }).success, true);
  assert.equal(walletTopupSchema.safeParse({ amount: -1 }).success, false);
  assert.equal(walletTopupSchema.safeParse({ amount: '100' }).success, false);
});

test('accountPurchaseSchema requires an accountId', () => {
  assert.equal(accountPurchaseSchema.safeParse({ accountId: 'abc' }).success, true);
  assert.equal(accountPurchaseSchema.safeParse({}).success, false);
});

test('smsSendSchema accepts a real 13-digit Nigerian number and enforces length', () => {
  assert.equal(smsSendSchema.safeParse({ phone: '2348012345678', message: 'hi' }).success, true);
  // Local format / wrong length rejected.
  assert.equal(smsSendSchema.safeParse({ phone: '08012345678', message: 'hi' }).success, false);
  assert.equal(smsSendSchema.safeParse({ phone: '234801234567', message: 'hi' }).success, false);
  // Over 160 chars rejected.
  assert.equal(smsSendSchema.safeParse({ phone: '2348012345678', message: 'a'.repeat(161) }).success, false);
});

test('forgotPasswordSchema requires a valid email', () => {
  assert.equal(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success, true);
  assert.equal(forgotPasswordSchema.safeParse({ email: 'nope' }).success, false);
  assert.equal(forgotPasswordSchema.safeParse({}).success, false);
});

test('resetPasswordSchema requires a token and a 6+ char password', () => {
  assert.equal(resetPasswordSchema.safeParse({ token: 'abc', password: 'secret1' }).success, true);
  assert.equal(resetPasswordSchema.safeParse({ token: '', password: 'secret1' }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token: 'abc', password: '123' }).success, false);
});

test('profileUpdateSchema allows partial updates and validates fields', () => {
  assert.equal(profileUpdateSchema.safeParse({ name: 'New Name' }).success, true);
  assert.equal(profileUpdateSchema.safeParse({}).success, true);
  assert.equal(profileUpdateSchema.safeParse({ email: 'bad' }).success, false);
  assert.equal(profileUpdateSchema.safeParse({ newPassword: '123' }).success, false);
});
