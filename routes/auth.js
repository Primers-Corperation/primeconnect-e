import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

import { authLimiter } from '../middleware/rateLimiter.js';
import { verifyToken } from '../middleware/jwtMiddleware.js';
import { validateRequest, registerSchema, loginSchema, profileUpdateSchema } from '../middleware/validation.js';

dotenv.config();
const router = express.Router();

// Register
router.post('/register', authLimiter, validateRequest(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ status: 'success', token, user });
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
    if (!user) return res.status(400).json({ status: 'error', message: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ status: 'error', message: 'Incorrect password' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ status: 'success', token, user });
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

export default router;
