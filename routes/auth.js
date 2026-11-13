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
import { exchangePrimersCode, validPrimersInput, PrimersIdError } from '../lib/primersId.js';

dotenv.config();
const router = express.Router();

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Never return the password hash to clients.
function publicUser(user) {
  const obj = user.toObject();
  delete obj.password;
  delete obj.primersIdSub;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  obj.primersIdLinked = Boolean(user.primersIdSub);
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

// A short-lived ticket that carries a verified Primers ID across one password sign-in, so the
// person can connect it without starting over. Signed with its own key so it can never be used
// as a session token.
const LINK_TICKET_TTL = '15m';
const linkKey = () => `${process.env.JWT_SECRET}:primers-link-ticket`;
export function signLinkTicket(sub, email) {
  return jwt.sign({ purpose: 'primers_link', sub, email }, linkKey(), { expiresIn: LINK_TICKET_TTL });
}
export function readLinkTicket(ticket) {
  if (typeof ticket !== 'string' || ticket.length > 2000) return null;
  try {
    const c = jwt.verify(ticket, linkKey());
    return c.purpose === 'primers_link' && c.sub && c.email ? c : null;
  } catch { return null; }
}

// Continue with Primers ID. Signs in a linked account or creates a new one. An existing PrimeConnect
// account with the same email is never merged automatically (emails here were never verified, and
// accounts hold money): its owner signs in with their password once and connects Primers ID in Settings.
router.post('/primers', authLimiter, async (req, res) => {
  if (!validPrimersInput(req.body)) return res.status(400).json({ status: 'error', message: 'That sign-in expired. Please try again.' });
  try {
    const who = await exchangePrimersCode(req.body);
    let user = await User.findOne({ primersIdSub: who.sub });
    if (!user) {
      if (await User.exists({ email: who.email })) {
        const linkTicket = signLinkTicket(who.sub, who.email);
        return res.status(409).json({
          status: 'error', code: 'link_required', linkTicket, email: who.email,
          message: 'You already have a PrimeConnect account with this email. Enter its password once to connect your Primers ID. Forgot it? Use “Forgot password”.',
        });
      }
      const unusable = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      user = await User.create({ name: who.name || who.email.split('@')[0], email: who.email, password: unusable, primersIdSub: who.sub });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ status: 'success', token, user: publicUser(user) });
  } catch (err) {
    if (err instanceof PrimersIdError) return res.status(400).json({ status: 'error', message: err.message });
    if (err.code === 11000) return res.status(409).json({ status: 'error', message: 'That Primers ID is already connected to another account.' });
    console.error('Primers ID sign-in error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable, please try again' });
  }
});

// Finish connecting after a password sign-in, using the ticket from "Continue with Primers ID".
// The ticket proves the Primers ID (verified email); the session proves the password. Both must be
// for the same email, so neither half alone can attach a Primers ID to someone else's wallet.
router.post('/primers/link-ticket', authLimiter, verifyToken, async (req, res) => {
  const claim = readLinkTicket(req.body?.ticket);
  if (!claim) return res.status(400).json({ status: 'error', message: 'That link expired. Please try Continue with Primers ID again.' });
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    if (String(user.email || '').toLowerCase() !== String(claim.email).toLowerCase()) {
      return res.status(403).json({ status: 'error', message: 'That Primers ID belongs to a different email than this account.' });
    }
    if (user.primersIdSub && user.primersIdSub !== claim.sub) {
      return res.status(409).json({ status: 'error', message: 'This account is already connected to another Primers ID.' });
    }
    const other = await User.findOne({ primersIdSub: claim.sub, _id: { $ne: user._id } }).select('_id');
    if (other) return res.status(409).json({ status: 'error', message: 'That Primers ID is already connected to another PrimeConnect account.' });
    user.primersIdSub = claim.sub;
    await user.save();
    res.json({ status: 'success', user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ status: 'error', message: 'That Primers ID is already connected to another PrimeConnect account.' });
    console.error('Primers ID ticket link error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable, please try again' });
  }
});

// Connect a Primers ID to the signed-in account.
router.post('/primers/link', verifyToken, async (req, res) => {
  if (!validPrimersInput(req.body)) return res.status(400).json({ status: 'error', message: 'That sign-in expired. Please try again.' });
  try {
    const who = await exchangePrimersCode(req.body);
    const other = await User.findOne({ primersIdSub: who.sub }).select('_id');
    if (other && String(other._id) !== String(req.userId)) {
      return res.status(409).json({ status: 'error', message: 'That Primers ID is already connected to another PrimeConnect account.' });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    user.primersIdSub = who.sub;
    await user.save();
    res.json({ status: 'success', user: publicUser(user) });
  } catch (err) {
    if (err instanceof PrimersIdError) return res.status(400).json({ status: 'error', message: err.message });
    console.error('Primers ID link error:', err.message);
    res.status(503).json({ status: 'error', message: 'Service temporarily unavailable, please try again' });
  }
});

// Get the authenticated user's profile.
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', user: publicUser(user) });
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
