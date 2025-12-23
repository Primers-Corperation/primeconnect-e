import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import smsRoutes from './routes/sms.js';
import walletRoutes from './routes/wallet.js';
import accountsRoutes from './routes/accounts.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/accounts', accountsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PrimeConnect backend running on port ${PORT}`));
