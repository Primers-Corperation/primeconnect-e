import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.js';
import smsRoutes from './routes/sms.js';
import walletRoutes from './routes/wallet.js';
import accountsRoutes from './routes/accounts.js';

import { generalLimiter } from './middleware/rateLimiter.js';
import { verifyToken } from './middleware/jwtMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb' }));

// Rate limiting
app.use(generalLimiter);

// MongoDB connection
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set — database-backed routes will fail until it is configured');
}
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// Public routes
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "PrimeConnect API",
    version: "1.0.0"
  });
});

// Protected routes (JWT required)
app.use('/api/sms', verifyToken, smsRoutes);
app.use('/api/wallet', verifyToken, walletRoutes);
app.use('/api/accounts', verifyToken, accountsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PrimeConnect backend running on port ${PORT}`));

// Global error handler (must be last)
app.use(errorHandler);
