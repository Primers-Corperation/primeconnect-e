import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import User from '../models/User.js';

import { smsLimiter } from '../middleware/rateLimiter.js';
import { validateRequest, getNumberSchemaNoUserId } from '../middleware/validation.js';

dotenv.config();
const router = express.Router();

const GRIZZLY_BASE = 'https://api.grizzlysms.com/stubs/handler_api.php';

function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) q.append(k, v);
  });
  return q.toString();
}

router.post('/getNumber', smsLimiter, validateRequest(getNumberSchemaNoUserId), async (req, res) => {
  const { service, country, maxPrice, providers, exclude } = req.body;
  const userId = req.userId; // From JWT token, not from request body

  // TODO: Check user balance before request

  const query = buildQuery({
    api_key: process.env.GRIZZLY_API_KEY,
    action: 'getNumber',
    service,
    country,
    maxPrice,
    providerIds: providers,
    exceptProviderIds: exclude
  });

  try {
    const r = await fetch(`${GRIZZLY_BASE}?${query}`);
    const text = await r.text();

    if (text.startsWith('ACCESS_NUMBER')) {
      const [, activationId, number] = text.split(':');
      // TODO: Save activation to DB with userId
      return res.json({ status: 'success', activationId, number });
    }

    return res.status(400).json({ status: 'error', message: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

export default router;
