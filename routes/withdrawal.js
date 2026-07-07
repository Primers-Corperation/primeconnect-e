import express from 'express';
import crypto from 'crypto';

import Withdrawal from '../models/Withdrawal.js';
import Wallet from '../models/Wallet.js';
import { listBanks, resolveAccount, createTransferRecipient, initiateTransfer } from '../lib/paystack.js';
import { validateRequest, resolveAccountSchema, withdrawalSchema } from '../middleware/validation.js';

const MIN_WITHDRAWAL = 1000;

// Bank list rarely changes — cache in-memory for an hour (same pattern as
// lib/fx.js), shared across warm serverless invocations via `global`.
const bankCache = global._bankCache || (global._bankCache = { banks: null, fetchedAt: 0 });
const BANK_CACHE_TTL_MS = 60 * 60 * 1000;

const router = express.Router();

router.get('/banks', async (req, res) => {
  try {
    const isFresh = bankCache.banks && Date.now() - bankCache.fetchedAt < BANK_CACHE_TTL_MS;
    if (!isFresh) {
      bankCache.banks = await listBanks();
      bankCache.fetchedAt = Date.now();
    }
    res.json({ status: 'success', banks: bankCache.banks });
  } catch (err) {
    console.error('List banks error:', err.response?.data || err.message);
    res.status(502).json({ status: 'error', message: 'Could not load banks. Please try again.' });
  }
});

// Resolve an account number to its real holder name — read-only, no money
// movement. The UI must show this to the user for confirmation before
// they can submit a withdrawal.
router.post('/resolve-account', validateRequest(resolveAccountSchema), async (req, res) => {
  const { accountNumber, bankCode } = req.body;
  try {
    const account = await resolveAccount(accountNumber, bankCode);
    res.json({ status: 'success', accountName: account.account_name });
  } catch (err) {
    console.error('Resolve account error:', err.response?.data || err.message);
    res.status(400).json({ status: 'error', message: 'Could not verify this account. Check the number and bank.' });
  }
});

router.post('/', validateRequest(withdrawalSchema), async (req, res) => {
  const { amount, accountNumber, bankCode } = req.body;
  const userId = req.userId;

  if (amount < MIN_WITHDRAWAL) {
    return res.status(400).json({ status: 'error', message: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString('en-NG')}.` });
  }

  // Re-resolve server-side — never trust a client-supplied account name.
  let accountName;
  try {
    const account = await resolveAccount(accountNumber, bankCode);
    accountName = account.account_name;
  } catch (err) {
    console.error('Resolve account error:', err.response?.data || err.message);
    return res.status(400).json({ status: 'error', message: 'Could not verify this account. Check the number and bank.' });
  }

  // Reserve funds atomically before any external call — two concurrent
  // withdrawals can't both succeed against a balance that only covers one.
  const wallet = await Wallet.findOneAndUpdate(
    { userId, balance: { $gte: amount } },
    { $inc: { balance: -amount } },
    { new: true }
  );
  if (!wallet) {
    return res.status(400).json({ status: 'error', message: 'Insufficient wallet balance.' });
  }

  const reference = crypto.randomUUID();
  const withdrawal = await Withdrawal.create({
    userId, reference, amount, bankCode, accountNumber, accountName, status: 'pending',
  });

  try {
    const recipient = await createTransferRecipient({ name: accountName, accountNumber, bankCode });
    withdrawal.recipientCode = recipient.recipient_code;
    await withdrawal.save();

    const transfer = await initiateTransfer({
      amountKobo: Math.round(amount * 100),
      recipientCode: recipient.recipient_code,
      reason: 'PrimeConnect wallet withdrawal',
      reference,
    });
    withdrawal.transferCode = transfer.transfer_code;
    await withdrawal.save();

    if (transfer.status === 'otp') {
      // OTP finalization isn't supported by this self-service flow — this
      // withdrawal can never complete automatically, so refund immediately
      // rather than leave money stuck in limbo.
      console.error('Transfer requires OTP — refunding. Check Paystack transfer OTP setting.');
      withdrawal.status = 'failed';
      await withdrawal.save();
      await Wallet.updateOne({ userId }, { $inc: { balance: amount } });
      return res.status(503).json({ status: 'error', message: 'Withdrawals are temporarily unavailable. Please try again later.' });
    }

    // Normal case: Paystack returns 'pending' here and confirms the real
    // outcome via webhook (transfer.success / transfer.failed / .reversed).
    // Do not refund on this response — the webhook is authoritative.
    return res.json({ status: 'success', message: 'Your withdrawal is being processed.', balance: wallet.balance });
  } catch (err) {
    console.error('Withdrawal request error:', err.response?.data || err.message);
    // An outright request failure (bad recipient, provider-side rejection)
    // is a confirmed non-success — safe to refund. A network/timeout error
    // is ambiguous (the transfer may have actually gone through), so it is
    // NOT refunded here — left pending for the webhook to resolve, exactly
    // like the equivalent case in the Grizzly rental flow.
    if (err.response) {
      withdrawal.status = 'failed';
      await withdrawal.save();
      await Wallet.updateOne({ userId }, { $inc: { balance: amount } });
      return res.status(502).json({ status: 'error', message: 'Could not process your withdrawal. Please try again.' });
    }
    return res.status(202).json({ status: 'pending', message: 'Your withdrawal is being processed.' });
  }
});

export default router;
