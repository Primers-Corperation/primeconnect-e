import express from 'express';
import User from '../models/User.js';
import { sendMail } from '../lib/mailer.js';
import { supportLimiter } from '../middleware/rateLimiter.js';
import { validateRequest, supportReportSchema } from '../middleware/validation.js';

const router = express.Router();

// Report an issue — emails the report to the configured admin inbox,
// including the reporting user's name/email so they can be replied to.
router.post('/report', supportLimiter, validateRequest(supportReportSchema), async (req, res) => {
  const { subject, message } = req.body;
  try {
    const user = await User.findById(req.userId);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
      return res.status(503).json({ status: 'error', message: 'Support is not configured yet.' });
    }

    const sent = await sendMail({
      to: adminEmail,
      subject: `[PrimeConnect support] ${subject}`,
      text: `From: ${user?.name || 'Unknown'} <${user?.email || 'unknown'}>\nUser ID: ${req.userId}\n\n${message}`,
      replyTo: user?.email,
    });

    if (!sent) {
      return res.status(503).json({ status: 'error', message: 'Support email is not configured yet.' });
    }

    return res.json({ status: 'success', message: 'Your report has been sent. We will get back to you by email.' });
  } catch (err) {
    console.error('Support report error:', err.message);
    return res.status(500).json({ status: 'error', message: 'Could not send your report. Please try again.' });
  }
});

export default router;
