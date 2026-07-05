import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validation.js';

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

export default router;
