import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true }, // Naira
  bankCode: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  recipientCode: { type: String },
  transferCode: { type: String },
  status: { type: String, enum: ['pending', 'success', 'failed', 'reversed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Withdrawal', withdrawalSchema);
