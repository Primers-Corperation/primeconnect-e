import React from 'react';

/**
 * Status pill / label. Semantic tones map to PrimeConnect statuses
 * (available, sold, pending, success, failed) plus neutral/accent.
 */
export function Badge({ children, tone = 'neutral', dot = false, size = 'md' }) {
  const tones = {
    neutral: { bg: 'var(--pc-surface-3)', fg: 'var(--pc-text-muted)', dot: 'var(--pc-text-dim)' },
    accent:  { bg: 'color-mix(in srgb, var(--pc-accent) 28%, transparent)', fg: 'var(--pc-ink)', dot: 'var(--pc-accent-strong)' },
    success: { bg: 'var(--pc-success-bg)', fg: 'var(--pc-success)', dot: 'var(--pc-success)' },
    warning: { bg: 'var(--pc-warning-bg)', fg: 'var(--pc-warning)', dot: 'var(--pc-warning)' },
    danger:  { bg: 'var(--pc-danger-bg)', fg: 'var(--pc-danger)', dot: 'var(--pc-danger)' },
    info:    { bg: 'var(--pc-info-bg)', fg: 'var(--pc-info)', dot: 'var(--pc-info)' },
  };
  // status aliases
  const alias = { available: 'success', sold: 'neutral', pending: 'warning', active: 'success', failed: 'danger', expired: 'danger' };
  const t = tones[tone] || tones[alias[tone]] || tones.neutral;
  const dims = size === 'sm'
    ? { padding: '3px 8px', fontSize: 11, gap: 5, dot: 5 }
    : { padding: '5px 11px', fontSize: 12.5, gap: 6, dot: 6 };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: dims.gap,
      padding: dims.padding, fontSize: dims.fontSize, fontWeight: 600,
      lineHeight: 1, borderRadius: 'var(--pc-radius-full)',
      background: t.bg, color: t.fg, fontFamily: 'var(--pc-font-sans)',
      textTransform: 'capitalize', letterSpacing: '.01em',
    }}>
      {dot ? <span style={{ width: dims.dot, height: dims.dot, borderRadius: '50%', background: t.dot }} /> : null}
      {children}
    </span>
  );
}

export default Badge;
