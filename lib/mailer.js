import nodemailer from 'nodemailer';

let cachedTransporter = null;

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return cachedTransporter;
}

// Sends an email via Gmail SMTP. Returns false (never throws) when
// EMAIL_USER/EMAIL_PASS aren't configured, so callers can surface a clear
// "not configured yet" message instead of a crash.
export async function sendMail({ to, subject, text, replyTo }) {
  const transporter = getTransporter();
  if (!transporter) return false;
  await transporter.sendMail({
    from: `PrimeConnect <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    replyTo,
  });
  return true;
}
