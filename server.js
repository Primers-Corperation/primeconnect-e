import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.js';
import smsRoutes from './routes/sms.js';
import walletRoutes from './routes/wallet.js';
import accountsRoutes from './routes/accounts.js';
import paymentRoutes, { paystackWebhook } from './routes/payment.js';
import supportRoutes from './routes/support.js';
import withdrawalRoutes from './routes/withdrawal.js';

import { generalLimiter } from './middleware/rateLimiter.js';
import { verifyToken } from './middleware/jwtMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
// Keep the raw body so the Paystack webhook can verify its HMAC signature.
app.use(express.json({ limit: '10kb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ limit: '10kb' }));

// Rate limiting
app.use(generalLimiter);

// MongoDB connection
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set — database-backed routes will fail until it is configured');
}
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set — authentication (register/login/JWT verification) will fail until it is configured');
}
if (!process.env.PAYSTACK_SECRET_KEY) {
  console.warn('PAYSTACK_SECRET_KEY is not set — wallet top-ups will fail until it is configured');
}
if (!process.env.CLIENT_URL) {
  console.warn('CLIENT_URL is not set — Paystack callback will fall back to the dashboard default');
}
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('EMAIL_USER/EMAIL_PASS are not set — support reports will fail until they are configured');
}

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "PrimeConnect API",
    version: "1.0.0"
  });
});

// Every remaining route needs the DB — connect once (reusing the cached
// connection across warm invocations) before reaching any of them, and
// fail fast and consistently if it's genuinely unreachable.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable, please try again' });
  }
});

// Public routes
app.use('/api/auth', authRoutes);

// Paystack webhook — public (authenticated by HMAC signature, not JWT).
app.post('/api/payment/webhook', paystackWebhook);

// Protected routes (JWT required)
app.use('/api/sms', verifyToken, smsRoutes);
// Mount the Paystack top-up and withdrawal routes before the generic
// wallet router so the more specific paths match first.
app.use('/api/wallet/paystack', verifyToken, paymentRoutes);
app.use('/api/wallet/withdraw', verifyToken, withdrawalRoutes);
app.use('/api/wallet', verifyToken, walletRoutes);
app.use('/api/accounts', verifyToken, accountsRoutes);
app.use('/api/support', verifyToken, supportRoutes);

// Global error handler (must be registered after all routes, before listen)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PrimeConnect backend running on port ${PORT}`));
