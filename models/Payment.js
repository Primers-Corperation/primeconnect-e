import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true }, // Naira credited to the wallet on success
  chargedAmount: { type: Number, required: true }, // Naira actually charged on Paystack (amount + fee cushion)
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  channel: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Payment', paymentSchema);
