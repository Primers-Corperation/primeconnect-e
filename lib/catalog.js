import { getUsdToNgnRate } from './fx.js';

// Grizzly's full service list runs into the thousands, most of them
// obscure regional apps. These 10 are verified against the live API
// (code -> real name confirmed via GET /api/sms/services) and match the
// services already represented in the frontend's ServiceIcon component.
export const KNOWN_SERVICES = [
  { code: 'wa', name: 'WhatsApp', icon: 'whatsapp' },
  { code: 'tg', name: 'Telegram', icon: 'telegram' },
  { code: 'ig', name: 'Instagram', icon: 'instagram' },
  { code: 'fb', name: 'Facebook', icon: 'facebook' },
  { code: 'go', name: 'Google', icon: 'google' },
  { code: 'lf', name: 'TikTok', icon: 'tiktok' },
  { code: 'tw', name: 'Twitter / X', icon: 'twitter' },
  { code: 'am', name: 'Amazon', icon: 'amazon' },
  { code: 'ub', name: 'Uber', icon: 'uber' },
  { code: 'ds', name: 'Discord', icon: 'discord' },
];

export function findKnownService(code) {
  return KNOWN_SERVICES.find((s) => s.code === code);
}

export function getPriceMultiplier() {
  const n = Number(process.env.PRICE_MULTIPLIER);
  return Number.isFinite(n) && n > 0 ? n : 4;
}

// Grizzly's `cost` is in USD. Convert to NGN at the live rate, then apply
// the retail markup. Always rounds up so we never undercharge.
export async function usdCostToNgnPrice(usdCost) {
  const rate = await getUsdToNgnRate();
  const multiplier = getPriceMultiplier();
  return Math.ceil(usdCost * rate * multiplier);
}
