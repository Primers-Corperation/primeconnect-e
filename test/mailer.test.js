import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { sendMail } from '../lib/mailer.js';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
});

test('sendMail returns false (no throw) when RESEND_API_KEY is not set', async () => {
  delete process.env.RESEND_API_KEY;
  let called = false;
  globalThis.fetch = async () => { called = true; return { ok: true, text: async () => '' }; };
  const result = await sendMail({ to: 'a@b.com', subject: 'hi', text: 'yo' });
  assert.equal(result, false);
  assert.equal(called, false, 'must not call the API when unconfigured');
});

test('sendMail posts to the Resend API with the expected payload and returns true', async () => {
  process.env.RESEND_API_KEY = 'test-key';
  process.env.EMAIL_FROM = 'PrimeConnect <no-reply@example.com>';
  let captured;
  globalThis.fetch = async (url, opts) => {
    captured = { url, opts };
    return { ok: true, text: async () => '{"id":"1"}' };
  };

  const result = await sendMail({ to: 'user@example.com', subject: 'Reset', text: 'link', replyTo: 'r@e.com' });

  assert.equal(result, true);
  assert.equal(captured.url, 'https://api.resend.com/emails');
  assert.equal(captured.opts.method, 'POST');
  assert.equal(captured.opts.headers.Authorization, 'Bearer test-key');
  const body = JSON.parse(captured.opts.body);
  assert.equal(body.from, 'PrimeConnect <no-reply@example.com>');
  assert.equal(body.to, 'user@example.com');
  assert.equal(body.subject, 'Reset');
  assert.equal(body.text, 'link');
  assert.equal(body.reply_to, 'r@e.com'); // replyTo maps to Resend's reply_to
});

test('sendMail throws on a hard API error', async () => {
  process.env.RESEND_API_KEY = 'test-key';
  globalThis.fetch = async () => ({ ok: false, status: 422, text: async () => 'bad from address' });
  await assert.rejects(
    () => sendMail({ to: 'user@example.com', subject: 'x', text: 'y' }),
    /Resend API error 422/
  );
});
