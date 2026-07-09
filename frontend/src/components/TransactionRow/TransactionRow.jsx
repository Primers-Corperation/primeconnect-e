import React from 'react';

/**
 * Wallet transaction line item. Type drives the icon and the signed,
 * colored amount. Mirrors the Wallet model's transaction types
 * (deposit / withdrawal / purchase).
 */
const META = {
  deposit:    { color: 'var(--pc-success)', bg: 'var(--pc-success-bg)', sign: '+', glyph: 'M12 5v14M5 12h14' },
  withdrawal: { color: 'var(--pc-warning)', bg: 'var(--pc-warning-bg)', sign: '-', glyph: 'M5 12h14' },
  purchase:   { color: 'var(--pc-ink)', bg: 'var(--pc-surface-3)', sign: '-', glyph: 'M6 6h15l-1.5 9h-12zM6 6L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2M18 20a1 1 0 100-2 1 1 0 000 2' },
};

export function TransactionRow({ type = 'purchase', description = '', date = '', amount = 0 }) {
  const m = META[type] || META.purchase;
  const abs = Math.abs(Number(amount) || 0);
  const naira = m.sign + '\u20A6' + abs.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '13px 4px',
      borderBottom: '1px solid var(--pc-border)', fontFamily: 'var(--pc-font-sans)',
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 38, height: 38, borderRadius: 10, background: m.bg, color: m.color, flexShrink: 0,
      }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={m.glyph} />
        </svg>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--pc-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {description || (type[0].toUpperCase() + type.slice(1))}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--pc-text-dim)', marginTop: 2, textTransform: 'capitalize' }}>
          {type}{date ? ' · ' + date : ''}
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--pc-font-mono)', color: m.sign === '+' ? 'var(--pc-success)' : 'var(--pc-text)', flexShrink: 0 }}>
        {naira}
      </div>
    </div>
  );
}

export default TransactionRow;
