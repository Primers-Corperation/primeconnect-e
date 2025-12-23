import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  service: String,
  accountDetails: String,
  price: Number,
  status: { type: String, default: 'available' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Account', accountSchema);
