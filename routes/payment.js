import express from 'express';
import crypto from 'crypto';

import Payment from '../models/Payment.js';
import Withdrawal from '../models/Withdrawal.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import { initializeTransaction, verifyTransaction } from '../lib/paystack.js';
import { validateRequest, paystackInitSchema } from '../middleware/validation.js';

// Idempotently credit a wallet for a successful Paystack charge.
// The Payment status transition is atomic: only the caller that flips
// `pending -> success` performs the credit, so the webhook, the verify
// endpoint, and any Paystack retries can never double-credit a reference.
// Returns the new balance, or null if the payment was already processed,
// unknown, or failed an amount check.
async function creditIfPending(reference, paystackAmountKobo, channel) {
  const payment = await Payment.findOneAndUpdate(
    { reference, status: 'pending' },
    { status: 'success', channel },
    { new: true }
  );
  if (!payment) return null; // already processed or unknown reference

  // Defensive: Paystack's charged amount (kobo) must match what we recorded.
  if (paystackAmountKobo != null && Math.round(payment.amount * 100) !== paystackAmountKobo) {
    payment.status = 'failed';
    await payment.save();
    return null;
  }

  let wallet = await Wallet.findOne({ userId: payment.userId });
  if (!wallet) wallet = new Wallet({ userId: payment.userId, balance: 0 });
  wallet.balance += payment.amount;
  wallet.transactions.push({
    type: 'deposit',
    amount: payment.amount,
    description: 'Wallet top-up (Paystack)',
    reference,
  });
  await wallet.save();
  return wallet.balance;
}

// Idempotently resolve a withdrawal to its final state. The status
// transition is atomic (pending -> finalStatus): only the caller that wins
// the transition acts on it, so webhook retries are always safe. Only a
// failed/reversed outcome refunds the wallet — a success needs no wallet
// change (it was already debited when the withdrawal was requested).
async function resolveWithdrawal(reference, finalStatus) {
  const withdrawal = await Withdrawal.findOneAndUpdate(
    { reference, status: 'pending' },
    { status: finalStatus },
    { new: true }
  );
  if (!withdrawal) return; // already resolved or unknown reference

  if (finalStatus === 'failed' || finalStatus === 'reversed') {
    await Wallet.findOneAndUpdate(
      { userId: withdrawal.userId },
      {
        $inc: { balance: withdrawal.amount },
        $push: { transactions: { type: 'deposit', amount: withdrawal.amount, description: `Refund: withdrawal ${finalStatus}`, reference } },
      }
    );
  }
}

// ---- Protected router (mounted under /api/wallet/paystack, requires JWT) ----
const router = express.Router();

// Start a top-up: create a pending Payment and hand back Paystack's checkout URL.
router.post('/initialize', validateRequest(paystackInitSchema), async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    const reference = crypto.randomUUID();
    await Payment.create({ userId: req.userId, reference, amount, status: 'pending' });

    const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
    const init = await initializeTransaction({
      email: user.email,
      amountKobo: Math.round(amount * 100),
      reference,
      callbackUrl: clientUrl ? `${clientUrl}/wallet/callback` : undefined,
    });

    res.json({ status: 'success', authorization_url: init.authorization_url, reference });
  } catch (err) {
    console.error('Paystack initialize error:', err.response?.data || err.message);
    res.status(502).json({ status: 'error', message: 'Could not start payment. Please try again.' });
  }
});

// Verify a top-up after the user returns from checkout (UX convenience;
// the webhook is the authoritative crediting path).
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const payment = await Payment.findOne({ reference });
    if (!payment) return res.status(404).json({ status: 'error', message: 'Payment not found' });
    if (String(payment.userId) !== req.userId) {
      return res.status(403).json({ status: 'error', message: 'Unauthorized' });
    }

    const data = await verifyTransaction(reference);
    if (data.status !== 'success') {
      return res.json({ status: 'pending', message: 'Payment not completed yet' });
    }

    await creditIfPending(reference, data.amount, data.channel);
    const wallet = await Wallet.findOne({ userId: payment.userId });
    res.json({ status: 'success', balance: wallet ? wallet.balance : 0 });
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    res.status(502).json({ status: 'error', message: 'Could not verify payment. Please try again.' });
  }
});

// ---- Public webhook (mounted at /api/payment/webhook, NO JWT) ----
// Paystack authenticates itself with an HMAC-SHA512 signature over the raw body.
export async function paystackWebhook(req, res) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.sendStatus(500);

  const signature = req.headers['x-paystack-signature'];
  const raw = req.rawBody || Buffer.from(JSON.stringify(req.body));
  const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex');
  if (!signature || hash !== signature) {
    return res.status(401).json({ status: 'error', message: 'Invalid signature' });
  }

  try {
    const event = req.body;
    if (event?.event === 'charge.success') {
      const { reference, amount, channel } = event.data;
      await creditIfPending(reference, amount, channel);
    } else if (event?.event === 'transfer.success') {
      await resolveWithdrawal(event.data.reference, 'success');
    } else if (event?.event === 'transfer.failed') {
      await resolveWithdrawal(event.data.reference, 'failed');
    } else if (event?.event === 'transfer.reversed') {
      await resolveWithdrawal(event.data.reference, 'reversed');
    }
    return res.sendStatus(200);
  } catch (err) {
    // Return 500 so Paystack retries; both handlers above are idempotent
    // (atomic pending -> finalStatus transitions), so retries are safe.
    console.error('Paystack webhook processing error:', err.message);
    return res.sendStatus(500);
  }
}

export default router;
