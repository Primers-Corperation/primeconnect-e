import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import Activation from '../models/Activation.js';
import Wallet from '../models/Wallet.js';

import axios from 'axios';
import { smsLimiter } from '../middleware/rateLimiter.js';
import { validateRequest, getNumberSchemaNoUserId, smsSendSchema } from '../middleware/validation.js';
import { KNOWN_SERVICES, KNOWN_COUNTRIES, DEFAULT_COUNTRY_ID, findKnownService, usdCostToNgnPrice } from '../lib/catalog.js';

const NIGERIA_COUNTRY_ID = String(DEFAULT_COUNTRY_ID); // verified against GET /api/sms/countries
const CANCEL_WINDOW_MS = 15 * 60 * 1000;

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

// Real, priced catalog of our supported services for a country (default
// Nigeria). One getPrices call returns every service for that country;
// we pick out the known/supported ones, convert Grizzly's USD cost to
// NGN at the live rate, and apply the retail markup.
router.get('/catalog', async (req, res) => {
  if (!process.env.GRIZZLY_API_KEY) {
    return res.status(503).json({ status: 'error', message: 'Catalog is not configured yet.' });
  }
  const country = req.query.country || NIGERIA_COUNTRY_ID;
  const minPrice = req.query.minPrice != null ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : null;
  const search = req.query.search ? String(req.query.search).toLowerCase().trim() : '';

  const query = buildQuery({ api_key: process.env.GRIZZLY_API_KEY, action: 'getPrices', country });
  try {
    const r = await fetch(`${GRIZZLY_BASE}?${query}`);
    const text = await r.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = null; }
    const countryBlock = parsed && parsed[String(country)];
    if (!countryBlock) {
      return res.status(502).json({ status: 'error', message: 'Could not load prices for this country' });
    }

    const items = [];
    for (const svc of KNOWN_SERVICES) {
      if (search && !svc.name.toLowerCase().includes(search)) continue;
      const entry = countryBlock[svc.code];
      if (!entry || !entry.count) continue; // no stock right now
      const priceNgn = await usdCostToNgnPrice(entry.cost);
      if (minPrice != null && priceNgn < minPrice) continue;
      if (maxPrice != null && priceNgn > maxPrice) continue;
      items.push({ service: svc.code, name: svc.name, icon: svc.icon, priceNgn, available: entry.count });
    }
    items.sort((a, b) => a.priceNgn - b.priceNgn);
    return res.json({ status: 'success', country: Number(country), items });
  } catch (err) {
    console.error('Catalog error:', err.message);
    return res.status(502).json({ status: 'error', message: 'Could not load catalog' });
  }
});

// Curated country list for the picker (lightweight vs. Grizzly's raw 200+).
router.get('/supported-countries', (req, res) => {
  res.json({ status: 'success', countries: KNOWN_COUNTRIES });
});

// Real Grizzly service/country/price catalog (passthrough of getPrices).
// Returned as-is for now so the exact shape can be verified against the
// live API before any markup logic is built on top of it.
router.get('/prices', async (req, res) => {
  if (!process.env.GRIZZLY_API_KEY) {
    return res.status(503).json({ status: 'error', message: 'Pricing is not configured yet.' });
  }
  const { service, country } = req.query;
  const query = buildQuery({ api_key: process.env.GRIZZLY_API_KEY, action: 'getPrices', service, country });
  try {
    const r = await fetch(`${GRIZZLY_BASE}?${query}`);
    const text = await r.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = null; }
    if (parsed === null) {
      return res.status(502).json({ status: 'error', message: text || 'Unexpected response from provider' });
    }
    return res.json({ status: 'success', prices: parsed });
  } catch (err) {
    console.error('Grizzly getPrices error:', err.message);
    return res.status(502).json({ status: 'error', message: 'Could not fetch prices' });
  }
});

// Real Grizzly country list (passthrough of getCountries) — diagnostic,
// to confirm real country names/IDs before the catalog UI is built.
router.get('/countries', async (req, res) => {
  if (!process.env.GRIZZLY_API_KEY) {
    return res.status(503).json({ status: 'error', message: 'Not configured yet.' });
  }
  const query = buildQuery({ api_key: process.env.GRIZZLY_API_KEY, action: 'getCountries' });
  try {
    const r = await fetch(`${GRIZZLY_BASE}?${query}`);
    const text = await r.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = null; }
    if (parsed === null) {
      return res.status(502).json({ status: 'error', message: text || 'Unexpected response from provider' });
    }
    return res.json({ status: 'success', countries: parsed });
  } catch (err) {
    console.error('Grizzly getCountries error:', err.message);
    return res.status(502).json({ status: 'error', message: 'Could not fetch countries' });
  }
});

// Real Grizzly service list (passthrough of getServicesList) — diagnostic.
router.get('/services', async (req, res) => {
  if (!process.env.GRIZZLY_API_KEY) {
    return res.status(503).json({ status: 'error', message: 'Not configured yet.' });
  }
  const query = buildQuery({ api_key: process.env.GRIZZLY_API_KEY, action: 'getServicesList' });
  try {
    const r = await fetch(`${GRIZZLY_BASE}?${query}`);
    const text = await r.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = null; }
    if (parsed === null) {
      return res.status(502).json({ status: 'error', message: text || 'Unexpected response from provider' });
    }
    return res.json({ status: 'success', services: parsed });
  } catch (err) {
    console.error('Grizzly getServicesList error:', err.message);
    return res.status(502).json({ status: 'error', message: 'Could not fetch services' });
  }
});

// List the authenticated user's rented numbers (activations), enriched
// with the friendly service name/icon (activations only store the raw
// Grizzly code).
router.get('/activations', async (req, res) => {
  try {
    const activations = await Activation.find({ userId: req.userId }).sort({ createdAt: -1 });
    const enriched = activations.map((a) => {
      const known = findKnownService(a.service);
      const obj = a.toObject();
      return { ...obj, serviceName: known?.name || a.service, serviceIcon: known?.icon || a.service };
    });
    res.json({ status: 'success', activations: enriched });
  } catch (err) {
    console.error('List activations error:', err.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Check (and persist) the real status/OTP code of one of the user's
// activations. Response codes follow the documented SMS-activation-style
// convention; anything unrecognized is a no-op rather than a guess, so an
// unexpected format never corrupts activation state.
router.get('/activations/:id/status', async (req, res) => {
  if (!process.env.GRIZZLY_API_KEY) {
    return res.status(503).json({ status: 'error', message: 'Not configured yet.' });
  }
  try {
    const activation = await Activation.findOne({ _id: req.params.id, userId: req.userId });
    if (!activation) return res.status(404).json({ status: 'error', message: 'Activation not found' });

    const query = buildQuery({ api_key: process.env.GRIZZLY_API_KEY, action: 'getStatus', id: activation.activationId });
    const r = await fetch(`${GRIZZLY_BASE}?${query}`);
    const text = await r.text();

    if (text.startsWith('STATUS_OK')) {
      const [, code] = text.split(':');
      activation.status = 'active';
      activation.code = code;
      await activation.save();
    } else if (text === 'STATUS_CANCEL') {
      activation.status = 'cancelled';
      await activation.save();
    } else if (text === 'STATUS_WAIT_CODE' || text.startsWith('STATUS_WAIT_')) {
      // still pending — nothing to persist
    } else {
      console.error('Unrecognized getStatus response:', text);
    }

    const known = findKnownService(activation.service);
    const obj = activation.toObject();
    return res.json({ status: 'success', activation: { ...obj, serviceName: known?.name || activation.service, serviceIcon: known?.icon || activation.service } });
  } catch (err) {
    console.error('Status check error:', err.message);
    return res.status(502).json({ status: 'error', message: 'Could not check status' });
  }
});

// Cancel a pending rental within the 15-minute window, refunding the
// wallet only on an explicit, recognized cancellation success from
// Grizzly — an ambiguous response never triggers a refund.
router.post('/activations/:id/cancel', async (req, res) => {
  if (!process.env.GRIZZLY_API_KEY) {
    return res.status(503).json({ status: 'error', message: 'Not configured yet.' });
  }
  try {
    const activation = await Activation.findOne({ _id: req.params.id, userId: req.userId });
    if (!activation) return res.status(404).json({ status: 'error', message: 'Activation not found' });
    if (activation.status !== 'pending') {
      return res.status(400).json({ status: 'error', message: 'This rental can no longer be cancelled.' });
    }
    const ageMs = Date.now() - new Date(activation.createdAt).getTime();
    if (ageMs > CANCEL_WINDOW_MS) {
      return res.status(400).json({ status: 'error', message: 'The 15-minute cancellation window has passed.' });
    }

    const query = buildQuery({ api_key: process.env.GRIZZLY_API_KEY, action: 'setStatus', id: activation.activationId, status: 8 });
    const r = await fetch(`${GRIZZLY_BASE}?${query}`);
    const text = await r.text();

    if (text !== 'ACCESS_CANCEL') {
      console.error('Cancel not confirmed by provider:', text);
      return res.status(502).json({ status: 'error', message: 'Could not cancel this rental. Please try again.' });
    }

    activation.status = 'cancelled';
    await activation.save();
    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { balance: activation.cost }, $push: { transactions: { type: 'deposit', amount: activation.cost, description: `Refund: cancelled rental` } } },
      { new: true }
    );

    return res.json({ status: 'success', balance: wallet ? wallet.balance : undefined });
  } catch (err) {
    console.error('Cancel error:', err.message);
    return res.status(502).json({ status: 'error', message: 'Could not cancel this rental' });
  }
});

router.post('/getNumber', smsLimiter, validateRequest(getNumberSchemaNoUserId), async (req, res) => {
  const { service, country } = req.body;
  const userId = req.userId; // From JWT token, not from request body

  if (!process.env.GRIZZLY_API_KEY) {
    return res.status(503).json({ status: 'error', message: 'Number rental is not configured yet.' });
  }

  const known = findKnownService(service);
  if (!known) {
    return res.status(400).json({ status: 'error', message: 'Unsupported service.' });
  }

  // Look up the live, authoritative price for this exact service+country —
  // never trust a client-supplied price.
  let priceNgn;
  try {
    const priceQuery = buildQuery({ api_key: process.env.GRIZZLY_API_KEY, action: 'getPrices', service, country });
    const pr = await fetch(`${GRIZZLY_BASE}?${priceQuery}`);
    const priceData = JSON.parse(await pr.text());
    const entry = priceData?.[String(country)]?.[service];
    if (!entry || !entry.count) {
      return res.status(400).json({ status: 'error', message: 'This number is not currently available.' });
    }
    priceNgn = await usdCostToNgnPrice(entry.cost);
  } catch (err) {
    console.error('Price lookup error:', err.message);
    return res.status(502).json({ status: 'error', message: 'Could not determine price. Please try again.' });
  }

  // Reserve funds atomically (conditional on sufficient balance) before
  // calling Grizzly, so two concurrent rentals can't both succeed against
  // a balance that only covers one. Refunded below if Grizzly fails.
  const wallet = await Wallet.findOneAndUpdate(
    { userId, balance: { $gte: priceNgn } },
    { $inc: { balance: -priceNgn } },
    { new: true }
  );
  if (!wallet) {
    return res.status(400).json({ status: 'error', message: 'Insufficient wallet balance.' });
  }

  const query = buildQuery({ api_key: process.env.GRIZZLY_API_KEY, action: 'getNumber', service, country });

  try {
    const r = await fetch(`${GRIZZLY_BASE}?${query}`);
    const text = await r.text();

    if (text.startsWith('ACCESS_NUMBER')) {
      const [, activationId, number] = text.split(':');
      wallet.transactions.push({
        type: 'purchase',
        amount: -priceNgn,
        description: `${known.name} number rental`,
      });
      await wallet.save();
      const activation = await Activation.create({
        userId, activationId, number, service, country, status: 'pending', cost: priceNgn,
      });
      return res.json({ status: 'success', activation });
    }

    // Grizzly didn't provide a number — refund the reservation.
    await Wallet.updateOne({ userId }, { $inc: { balance: priceNgn } });
    return res.status(400).json({ status: 'error', message: text });
  } catch (err) {
    console.error(err);
    await Wallet.updateOne({ userId }, { $inc: { balance: priceNgn } });
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

router.post('/send', smsLimiter, validateRequest(smsSendSchema), async (req, res) => {
  const { phone, message } = req.body;

  try {
    const payload = {
      to: phone,
      from: process.env.TERMII_SENDER_ID,
      sms: message,
      type: "plain",
      channel: process.env.TERMII_CHANNEL,
      api_key: process.env.TERMII_API_KEY,
    };

    const response = await axios.post('https://api.ng.termii.com/api/sms/send', payload);

    // Termii success response contains message_id
    const { message_id } = response.data;

    console.log(`SMS Sent | ID: ${message_id} | To: ${phone} | Time: ${new Date().toISOString()}`);

    return res.json({ success: true, messageId: message_id });
  } catch (error) {
    console.error('Termii SMS Error:', error.response?.data || error.message);
    const apiError = error.response?.data?.message || 'Failed to send SMS';
    return res.status(error.response?.status || 500).json({ success: false, error: apiError });
  }
});

export default router;
