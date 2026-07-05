import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 },
  transactions: [{
    type: { type: String, enum: ['deposit', 'withdrawal', 'purchase'] },
    amount: Number,
    description: String,
    reference: String, // Paystack reference for deposits, when applicable
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Wallet', walletSchema);
