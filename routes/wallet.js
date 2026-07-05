import express from 'express';
import Wallet from '../models/Wallet.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Get the authenticated user's wallet: balance + transaction ledger.
// Returns a zeroed wallet (never 404) so a brand-new user gets a valid,
// empty ledger rather than an error.
router.get('/', async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });
    const transactions = wallet
      ? [...wallet.transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];
    res.json({ status: 'success', balance: wallet ? wallet.balance : 0, transactions });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Get wallet balance
router.get('/balance/:userId', async (req, res) => {
  const { userId } = req.params;

  // Verify that the token userId matches the requested userId
  if (req.userId !== userId) {
    return res.status(403).json({ status: 'error', message: 'Unauthorized' });
  }

  try {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ status: 'error', message: 'Wallet not found' });
    res.json({ status: 'success', balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// NOTE: the old `POST /topup` credited the wallet directly with no payment,
// which let any authenticated user mint unlimited balance. Top-ups now go
// exclusively through the Paystack flow (routes/payment.js): a verified
// payment credits the wallet via the signed webhook / verify endpoint.

export default router;
