import { getUsdToNgnRate } from './fx.js';

// Grizzly's full service list runs into the thousands, most of them
// obscure regional apps. These are verified against the live API (code ->
// real name confirmed via GET /api/sms/services) — a curated, recognizable
// subset rather than the full raw catalog. `icon` matches ServiceIcon.jsx's
// SERVICES map where a dedicated brand color exists; anything else falls
// back to ServiceIcon's built-in initial-letter chip, so no icon work is
// required to add a new entry here.
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
  { code: 'fu', name: 'Snapchat', icon: 'snapchat' },
  { code: 'nf', name: 'Netflix', icon: 'netflix' },
  { code: 'ts', name: 'PayPal', icon: 'paypal' },
  { code: 'aon', name: 'Binance', icon: 'binance' },
  { code: 'tn', name: 'LinkedIn', icon: 'linkedin' },
  { code: 'sf', name: 'Spotify', icon: 'spotify' },
  { code: 'uk', name: 'Airbnb', icon: 'airbnb' },
  { code: 'dh', name: 'eBay', icon: 'ebay' },
  { code: 'wx', name: 'Apple', icon: 'apple' },
  { code: 'mm', name: 'Microsoft', icon: 'microsoft' },
  { code: 'mb', name: 'Yahoo', icon: 'yahoo' },
  { code: 'wb', name: 'WeChat', icon: 'wechat' },
  { code: 'vi', name: 'Viber', icon: 'viber' },
  { code: 'rc', name: 'Skype', icon: 'skype' },
  { code: 'bnl', name: 'Reddit', icon: 'reddit' },
  { code: 'pnts', name: 'Pinterest', icon: 'pinterest' },
  { code: 'tum', name: 'Tumblr', icon: 'tumblr' },
  { code: 're', name: 'Coinbase', icon: 'coinbase' },
  { code: 'jg', name: 'Grab', icon: 'grab' },
  { code: 'tx', name: 'Bolt', icon: 'bolt' },
  { code: 'zk', name: 'Deliveroo', icon: 'deliveroo' },
  { code: 'ac', name: 'DoorDash', icon: 'doordash' },
  { code: 'ka', name: 'Shopee', icon: 'shopee' },
  { code: 'dl', name: 'Lazada', icon: 'lazada' },
  { code: 'nc', name: 'Payoneer', icon: 'payoneer' },
  { code: 'hb', name: 'Twitch', icon: 'twitch' },
  { code: 'mo', name: 'Bumble', icon: 'bumble' },
  { code: 'mt', name: 'Steam', icon: 'steam' },
  { code: 'aml', name: 'Xbox', icon: 'xbox' },
  { code: 'brk', name: 'Indeed', icon: 'indeed' },
  { code: 'abq', name: 'Upwork', icon: 'upwork' },
  { code: 'cn', name: 'Fiverr', icon: 'fiverr' },
  { code: 'rr', name: 'Wolt', icon: 'wolt' },
  { code: 'ls', name: 'Careem', icon: 'careem' },
  { code: 'sn', name: 'OLX', icon: 'olx' },
  { code: 'bab', name: 'Opera', icon: 'opera' },
  { code: 'nv', name: 'Naver', icon: 'naver' },
  { code: 'kt', name: 'KakaoTalk', icon: 'kakaotalk' },
  { code: 'li', name: 'Baidu', icon: 'baidu' },
  { code: 'ab', name: 'Alibaba', icon: 'alibaba' },
  { code: 'hx', name: 'AliExpress', icon: 'aliexpress' },
  { code: 'ep', name: 'Temu', icon: 'temu' },
  { code: 'aez', name: 'Shein', icon: 'shein' },
];

// Curated, recognizable countries — verified against GET /api/sms/countries.
// Grizzly supports 200+ countries; this keeps the picker fast and relevant.
export const KNOWN_COUNTRIES = [
  { id: 19, name: 'Nigeria' },
  { id: 187, name: 'USA' },
  { id: 16, name: 'United Kingdom' },
  { id: 22, name: 'India' },
  { id: 8, name: 'Kenya' },
  { id: 38, name: 'Ghana' },
  { id: 31, name: 'South Africa' },
  { id: 21, name: 'Egypt' },
  { id: 4, name: 'Philippines' },
  { id: 6, name: 'Indonesia' },
  { id: 66, name: 'Pakistan' },
  { id: 73, name: 'Brazil' },
  { id: 43, name: 'Germany' },
  { id: 78, name: 'France' },
  { id: 36, name: 'Canada' },
];

export const DEFAULT_COUNTRY_ID = 19; // Nigeria

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
