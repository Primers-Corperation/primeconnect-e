import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

import { verifyToken } from '../middleware/jwtMiddleware.js';

const SECRET = 'test-secret';

before(() => {
  process.env.JWT_SECRET = SECRET;
});

function mockRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('verifyToken rejects requests without a token', () => {
  const res = mockRes();
  let nextCalled = false;
  verifyToken({ headers: {} }, res, () => {
    nextCalled = true;
  });
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test('verifyToken rejects an invalid token', () => {
  const res = mockRes();
  let nextCalled = false;
  verifyToken({ headers: { authorization: 'Bearer not.a.token' } }, res, () => {
    nextCalled = true;
  });
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test('verifyToken accepts a valid token and sets req.userId', () => {
  const token = jwt.sign({ id: 'user-123' }, SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockRes();
  let nextCalled = false;
  verifyToken(req, res, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
  assert.equal(req.userId, 'user-123');
});
