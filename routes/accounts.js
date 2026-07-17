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

    // Atomically deduct only when the balance is sufficient. Without the
    // conditional update, two concurrent purchases could both pass a separate
    // balance check and overdraw the wallet.
    const wallet = await Wallet.findOneAndUpdate(
      { userId, balance: { $gte: account.price } },
      {
        $inc: { balance: -account.price },
        $push: { transactions: { type: 'purchase', amount: -account.price, description: `Purchased account ${account.service}` } },
      },
      { new: true }
    );
    if (!wallet) return res.status(400).json({ status: 'error', message: 'Insufficient balance' });

    // Atomically claim the account; only succeeds while it is still available,
    // preventing two buyers from purchasing the same account.
    const claimed = await Account.findOneAndUpdate(
      { _id: accountId, status: 'available' },
      { $set: { status: 'sold', userId } },
      { new: true }
    );

    if (!claimed) {
      // Lost the race for the account after debiting — refund the wallet.
      await Wallet.updateOne(
        { userId },
        {
          $inc: { balance: account.price },
          $push: { transactions: { type: 'deposit', amount: account.price, description: `Refund: account ${account.service} no longer available` } },
        }
      );
      return res.status(409).json({ status: 'error', message: 'Account no longer available' });
    }

    res.json({ status: 'success', account: claimed });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

export default router;
