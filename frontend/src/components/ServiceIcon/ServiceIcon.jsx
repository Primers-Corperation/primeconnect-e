import React from 'react';

/**
 * Colored service glyph used across PrimeConnect for the platform a
 * virtual number is being rented for (WhatsApp, Telegram, Google, ...).
 * Falls back to the service initial on a deterministic color chip.
 */
const SERVICES = {
  whatsapp:  { color: '#25D366', label: 'WA' },
  telegram:  { color: '#2AABEE', label: 'TG' },
  google:    { color: '#EA4335', label: 'G' },
  facebook:  { color: '#1877F2', label: 'FB' },
  instagram: { color: '#E1306C', label: 'IG' },
  tiktok:    { color: '#000000', label: 'TT' },
  twitter:   { color: '#1DA1F2', label: 'X' },
  discord:   { color: '#5865F2', label: 'DC' },
  amazon:    { color: '#FF9900', label: 'AZ' },
  uber:      { color: '#000000', label: 'UB' },
};

export function ServiceIcon({ service = '', size = 40 }) {
  const key = (service || '').toLowerCase().replace(/[^a-z]/g, '');
  const meta = SERVICES[key] || { label: (service[0] || '?').toUpperCase() };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: size * 0.28,
      background: '#000000', color: '#ffffff',
      fontSize: size * 0.36, fontWeight: 800, letterSpacing: '-.02em',
      fontFamily: 'var(--pc-font-sans)', flexShrink: 0, userSelect: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
    }}>
      {meta.label}
    </span>
  );
}

export default ServiceIcon;
