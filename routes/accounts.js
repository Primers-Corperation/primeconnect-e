import express from 'express';
import Account from '../models/Account.js';
import Wallet from '../models/Wallet.js';
import dotenv from 'dotenv';

import { validateRequest, accountPurchaseSchema } from '../middleware/validation.js';

dotenv.config();
const router = express.Router();

// Get available accounts (public endpoint)
router.get('/available', async (req, res) => {
  try {
    const accounts = await Account.find({ status: 'available' });
    res.json({ status: 'success', accounts });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Purchase account
router.post('/purchase', validateRequest(accountPurchaseSchema), async (req, res) => {
  const { accountId } = req.body;
  const userId = req.userId; // From JWT token, not from request body

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
