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
    res.status(400).json({ status: 'error', message: 'Email exists or error' });
  }
});

// Login
router.post('/login', authLimiter, validateRequest(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ status: 'error', message: 'User not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ status: 'error', message: 'Incorrect password' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ status: 'success', token, user });
});

export default router;
