import mongoose from 'mongoose';

const activationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activationId: String,
  number: String,
  service: String,
  country: String,
  status: { type: String, default: 'pending' },
  cost: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Activation', activationSchema);
