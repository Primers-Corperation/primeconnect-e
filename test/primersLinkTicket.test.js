import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-link-tickets';
const { signLinkTicket, readLinkTicket } = await import('../routes/auth.js');
const { verifyToken } = await import('../middleware/jwtMiddleware.js');

test('a link ticket round-trips its Primers ID and email', () => {
  const c = readLinkTicket(signLinkTicket('sub-123', 'a@b.ng'));
  assert.equal(c.sub, 'sub-123');
  assert.equal(c.email, 'a@b.ng');
  assert.equal(c.purpose, 'primers_link');
});

test('a session token is not accepted as a link ticket', () => {
  const session = jwt.sign({ id: 'u1' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  assert.equal(readLinkTicket(session), null);
});

test('a link ticket cannot be used as a session token', () => {
  const ticket = signLinkTicket('sub-123', 'a@b.ng');
  let status = 0;
  const res = { status(s) { status = s; return { json() {} }; } };
  let passed = false;
  verifyToken({ headers: { authorization: `Bearer ${ticket}` } }, res, () => { passed = true; });
  assert.equal(passed, false);
  assert.equal(status, 401);
});

test('tampered, oversized and missing tickets are rejected', () => {
  const t = signLinkTicket('sub-123', 'a@b.ng');
  assert.equal(readLinkTicket(t.slice(0, -2) + 'xx'), null);
  assert.equal(readLinkTicket('x'.repeat(3000)), null);
  assert.equal(readLinkTicket(undefined), null);
});
