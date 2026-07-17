// Sends email via Resend's HTTPS API (https://resend.com).
//
// The previous implementation used Gmail SMTP, which does not work on Vercel
// serverless functions (outbound SMTP is blocked there). Resend sends over
// plain HTTPS, so it works on Vercel, Render, and anywhere else.
//
// Returns false (never throws) when RESEND_API_KEY isn't configured, so callers
// can surface a clear "not configured yet" message instead of a crash. A hard
// failure from the API does throw, matching the previous behaviour.
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export async function sendMail({ to, subject, text, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  // Must be a verified sender in Resend. `onboarding@resend.dev` works out of
  // the box but only delivers to your own Resend account email — set
  // EMAIL_FROM to an address on a domain you've verified for real delivery.
  const from = process.env.EMAIL_FROM || 'PrimeConnect <onboarding@resend.dev>';

  const payload = { from, to, subject };
  if (text) payload.text = text;
  if (html) payload.html = html;
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend API error ${res.status}: ${detail}`);
  }
  return true;
}
