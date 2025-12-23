import express from 'express';
import Account from '../models/Account.js';
import Wallet from '../models/Wallet.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Get available accounts
router.get('/available', async (req, res) => {
  try {
    const accounts = await Account.find({ status: 'available' });
    res.json({ status: 'success', accounts });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Purchase account
router.post('/purchase', async (req, res) => {
  const { userId, accountId } = req.body;
  if (!userId || !accountId) return res.status(400).json({ status: 'error', message: 'Missing fields' });
  try {
    const account = await Account.findById(accountId);
    if (!account || account.status !== 'available') return res.status(404).json({ status: 'error', message: 'Account not available' });

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < account.price) return res.status(400).json({ status: 'error', message: 'Insufficient balance' });

    wallet.balance -= account.price;
    wallet.transactions.push({ type: 'purchase', amount: -account.price, description: `Purchased account ${account.service}` });
    await wallet.save();

    account.status = 'sold';
    account.userId = userId;
    await account.save();

    res.json({ status: 'success', account });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

export default router;
