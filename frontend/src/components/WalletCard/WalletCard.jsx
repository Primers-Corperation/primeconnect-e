import React from 'react';

function formatNaira(n) {
  const num = Number(n) || 0;
  return '\u20A6' + num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Hero wallet balance card with the PrimeConnect accent fill. Text and
 * controls adapt to the accent via --pc-on-accent, so it reads on a
 * bright-yellow or a dark accent alike.
 */
export function WalletCard({ balance = 0, label = 'Wallet balance', onTopUp, onWithdraw, footer = null }) {
  const btn = (primary) => ({
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '11px 16px', fontSize: 14.5, fontWeight: 700, borderRadius: 'var(--pc-radius-md)', cursor: 'pointer',
    fontFamily: 'var(--pc-font-sans)',
    border: primary ? '1px solid var(--pc-ink)' : '1px solid color-mix(in srgb, var(--pc-on-accent) 40%, transparent)',
    background: primary ? 'var(--pc-ink)' : 'color-mix(in srgb, var(--pc-on-accent) 12%, transparent)',
    color: primary ? '#fff' : 'var(--pc-on-accent)',
  });
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--pc-accent-grad)', borderRadius: 'var(--pc-radius-2xl)',
      padding: 26, color: 'var(--pc-on-accent)', fontFamily: 'var(--pc-font-sans)',
      boxShadow: 'var(--pc-shadow-md)',
    }}>
      <div style={{
        position: 'absolute', top: -60, right: -40, width: 200, height: 200,
        borderRadius: '50%', background: 'color-mix(in srgb, var(--pc-on-accent) 8%, transparent)', pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, opacity: 0.8, letterSpacing: '.02em' }}>{label}</div>
        <div style={{ fontSize: 'clamp(28px, 8vw, 42px)', fontWeight: 700, letterSpacing: '-.02em', margin: '8px 0 20px', fontFamily: 'var(--pc-font-display)', whiteSpace: 'nowrap' }}>
          {formatNaira(balance)}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onTopUp} style={btn(true)}>Top up</button>
          <button onClick={onWithdraw} style={btn(false)}>Withdraw</button>
        </div>
        {footer ? <div style={{ marginTop: 16, fontSize: 13, opacity: 0.85 }}>{footer}</div> : null}
      </div>
    </div>
  );
}

export default WalletCard;
