import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { looksLikeKey, checkKey, allowedForKey } from '../lib/apiKeys.js';

async function verifyApiKey(key, req, res, next) {
  try {
    const r = await checkKey(key);
    if (r.unavailable) return res.status(503).json({ status: 'error', message: 'API keys are temporarily unavailable. Try again shortly.' });
    if (!r.active || !r.sub) return res.status(401).json({ status: 'error', message: 'This API key is not valid, has expired or was revoked.' });
    const scopes = Array.isArray(r.scopes) ? r.scopes : [];
    const path = (req.baseUrl || '') + (req.path === '/' ? '' : req.path);
    if (!allowedForKey(req.method, path, scopes)) return res.status(403).json({ status: 'error', message: 'This API key does not have permission for that.' });
    const user = await User.findOne({ primersIdSub: r.sub }).select('_id');
    if (!user) return res.status(401).json({ status: 'error', message: 'Sign in to PrimeConnect once with Primers ID before using an API key here.' });
    req.userId = user._id.toString();
    req.apiKey = { id: r.key_id, scopes, env: r.env };
    return next();
  } catch (err) {
    return next(err);
  }
}

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Missing authorization token' });
  }
  if (looksLikeKey(token)) return verifyApiKey(token, req, res, next);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
};
