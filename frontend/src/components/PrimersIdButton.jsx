import React, { useState } from 'react';
import { startPrimersSignIn } from '../lib/primersId.js';

export function PrimersIdButton({ label = 'Continue with Primers ID', returnTo = '/dashboard', mode = 'signin' }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => { setBusy(true); startPrimersSignIn('primeconnect', returnTo, mode).catch(() => setBusy(false)); }}
      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px', borderRadius: 10,
        border: 0, background: '#4D78FF', color: '#fff', fontWeight: 700, fontSize: 14, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}
    >
      <svg width="12" height="16" viewBox="0 0 14 18" aria-hidden="true" fill="currentColor"><path d="M0 0h8.5a5.5 5.5 0 0 1 0 11H4v7H0V0zm4 4v3h4.5a1.5 1.5 0 0 0 0-3H4z" /></svg>
      {busy ? 'Opening Primers ID…' : label}
    </button>
  );
}

export function OrDivider({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--pc-text-muted)', margin: '16px 0' }}>
      <span style={{ flex: 1, height: 1, background: 'var(--pc-border)' }} />{text}<span style={{ flex: 1, height: 1, background: 'var(--pc-border)' }} />
    </div>
  );
}
