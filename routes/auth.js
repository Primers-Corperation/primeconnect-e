import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import dotenv from 'dotenv';

import { authLimiter } from '../middleware/rateLimiter.js';
import { verifyToken } from '../middleware/jwtMiddleware.js';
import {
  validateRequest,
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../middleware/validation.js';
import { sendMail } from '../lib/mailer.js';

dotenv.config();
const router = express.Router();

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Never return the password hash to clients.
function publicUser(user) {
  const obj = user.toObject();
  delete obj.password;
  return obj;
}

// Store only a hash of the reset token so a database leak cannot be used to
// reset accounts.
export function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Register
router.post('/register', authLimiter, validateRequest(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ status: 'success', token, user: publicUser(user) });
  } catch (err) {
    // Only a duplicate-key error means the email is taken; anything else
    // (e.g. the DB being unreachable) must not be reported as such.
    if (err.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'Email already registered' });
    }
    console.error('Register error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable, please try again' });
  }
});

// Login
router.post('/login', authLimiter, validateRequest(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    // Always run a bcrypt comparison and return one generic message so the
    // response time and body never reveal whether the email is registered.
    const match = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
    if (!user || !match) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ status: 'success', token, user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable, please try again' });
  }
});

// Get the authenticated user's profile.
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', user });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable, please try again' });
  }
});

// Update the authenticated user's profile (name, email, and/or password).
router.put('/me', verifyToken, validateRequest(profileUpdateSchema), async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;

    // A password change requires the current password to be verified.
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ status: 'error', message: 'Current password is required to set a new password' });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ status: 'error', message: 'Current password is incorrect' });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    const safe = user.toObject();
    delete safe.password;
    res.json({ status: 'success', user: safe });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'That email is already in use' });
    }
    console.error('Update profile error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable, please try again' });
  }
});

// Request a password reset. Always responds generically so it cannot be used
// to discover which emails are registered.
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), async (req, res) => {
  const { email } = req.body;
  const genericResponse = {
    status: 'success',
    message: 'If that email is registered, a password reset link has been sent.',
  };

  try {
    const user = await User.findOne({ email });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = hashResetToken(rawToken);
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const base = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${base}/reset-password?token=${rawToken}`;
      await sendMail({
        to: user.email,
        subject: 'Reset your PrimeConnect password',
        text:
          `You requested a password reset. Use this link within 1 hour:\n${resetUrl}\n\n` +
          `If you didn't request this, you can safely ignore this email.`,
      });
    }

    res.json(genericResponse);
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable, please try again' });
  }
});

// Complete a password reset using a valid, unexpired, single-use token.
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: hashResetToken(token),
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(password, 10);
    // Invalidate the token so it cannot be reused.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ status: 'success', message: 'Password has been reset. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable, please try again' });
  }
});

export default router;
