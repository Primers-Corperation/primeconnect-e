import React from 'react';

/**
 * Dashboard metric tile. Icon + label + big value, with an optional
 * signed delta chip (green up / red down).
 */
export function StatCard({ label, value, icon = null, delta = null, accent = 'var(--pc-ink)' }) {
  const up = typeof delta === 'string' ? delta.trim().startsWith('+') : (delta > 0);
  return (
    <div style={{
      background: 'var(--pc-surface-1)', border: '1px solid var(--pc-border)',
      borderRadius: 'var(--pc-radius-xl)', padding: 22, minWidth: 0,
      fontFamily: 'var(--pc-font-sans)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        {icon ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 10,
            background: 'color-mix(in srgb, ' + accent + ' 14%, transparent)',
            color: accent,
          }}>
            <span style={{ width: 20, height: 20, display: 'inline-flex' }}>{icon}</span>
          </span>
        ) : <span />}
        {delta != null ? (
          <span style={{
            fontSize: 12.5, fontWeight: 700, padding: '4px 9px', borderRadius: 999,
            background: up ? 'var(--pc-success-bg)' : 'var(--pc-danger-bg)',
            color: up ? 'var(--pc-success)' : 'var(--pc-danger)',
          }}>{delta}</span>
        ) : null}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--pc-text)', lineHeight: 1.05, fontFamily: 'var(--pc-font-display)' }}>
        {value}
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--pc-text-muted)', marginTop: 6, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

export default StatCard;
