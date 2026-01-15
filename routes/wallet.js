import express from 'express';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

import { validateRequest, walletTopupSchema } from '../middleware/validation.js';

dotenv.config();
const router = express.Router();

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

// Top up wallet
router.post('/topup', validateRequest(walletTopupSchema), async (req, res) => {
  const { amount } = req.body;
  const userId = req.userId; // From JWT token, not from request body

  try {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0 });
    }
    wallet.balance += parseFloat(amount);
    wallet.transactions.push({ type: 'deposit', amount: parseFloat(amount), description: 'Wallet top-up' });
    await wallet.save();
    res.json({ status: 'success', balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

export default router;
