import express from 'express';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Get wallet balance
router.get('/balance/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ status: 'error', message: 'Wallet not found' });
    res.json({ status: 'success', balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Top up wallet
router.post('/topup', async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount) return res.status(400).json({ status: 'error', message: 'Missing fields' });
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
