import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  walletBalance: { type: Number, default: 0 },
  // Linked Primers ID (its account number for PrimeConnect).
  primersIdSub: { type: String, unique: true, sparse: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
