import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell.jsx';
import { Button } from '../components/Button/Button.jsx';
import { StatCard } from '../components/StatCard/StatCard.jsx';
import { WalletCard } from '../components/WalletCard/WalletCard.jsx';
import { NumberCard } from '../components/NumberCard/NumberCard.jsx';
import { TransactionRow } from '../components/TransactionRow/TransactionRow.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { getBalance } from '../api/wallet.js';

function Icon({ d, color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      <path d={d} />
    </svg>
  );
}

// Sample data — the backend has no endpoints for stats, activations, the
// buy-a-number browser, or the ledger, so these mirror the design's own
// baked-in defaults rather than inventing an API contract.
const STATS = [
  { label: 'Active numbers', value: '12', delta: '+2', accent: 'var(--pc-ink)', icon: 'M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013 5.18 2 2 0 015 3h3a2 2 0 012 1.72c.13 1 .37 2 .72 2.94a2 2 0 01-.45 2.11L8.09 11.9a16 16 0 006 6l1.13-1.18a2 2 0 012.11-.45c.94.35 1.94.59 2.94.72A2 2 0 0122 16.92z' },
  { label: 'SMS received (30d)', value: '1,204', delta: '+12.4%', accent: '#06b6d4', icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z' },
  { label: 'Success rate', value: '98.4%', delta: '+0.6%', accent: '#22c55e', icon: 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3' },
  { label: 'Spent (30d)', value: '₦42,180', delta: '-4.1%', accent: '#f59e0b', icon: 'M2 5h20v14H2zM2 10h20' },
];

const COUNTRIES = [
  { flag: '🇳🇬', label: 'Nigeria', active: true },
  { flag: '🇺🇸', label: 'United States' },
  { flag: '🇬🇧', label: 'United Kingdom' },
  { flag: '🇮🇳', label: 'India' },
];

const NUMBERS = [
  { flag: '🇳🇬', number: '+234 800 555 0110', meta: 'Lagos · SMS + Voice', tag: 'Local', tagTone: 'accent', price: '₦300/mo' },
  { flag: '🇺🇸', number: '+1 (415) 555 0142', meta: 'San Francisco · SMS only', tag: 'Toll-free', tagTone: 'info', price: '₦450/mo' },
  { flag: '🇬🇧', number: '+44 20 7946 0958', meta: 'London · SMS + Voice', tag: 'Mobile', tagTone: 'success', price: '₦520/mo' },
  { flag: '🇮🇳', number: '+91 22 4567 8901', meta: 'Mumbai · SMS only', tag: 'Local', tagTone: 'accent', price: '₦380/mo' },
];

const ACTIVATIONS = [
  { service: 'WhatsApp', number: '+234 810 555 0192', country: 'Nigeria', status: 'active', price: 320, code: '739204', timeLeft: '18:42' },
  { service: 'Telegram', number: '+234 701 555 0044', country: 'Nigeria', status: 'pending', price: 280, timeLeft: '12:05' },
];

const LEDGER = [
  { type: 'deposit', description: 'Wallet top-up', date: 'Jul 3', amount: 5000 },
  { type: 'purchase', description: 'WhatsApp number · Nigeria', date: 'Jul 2', amount: 320 },
  { type: 'purchase', description: 'Telegram number · Nigeria', date: 'Jul 1', amount: 280 },
  { type: 'withdrawal', description: 'Withdrawal to GTBank', date: 'Jun 29', amount: 2000 },
];

const TAG_COLORS = {
  accent: { background: 'var(--pc-accent)', color: 'var(--pc-on-accent)' },
  info: { background: 'var(--pc-info-bg)', color: 'var(--pc-info)' },
  success: { background: 'var(--pc-success-bg)', color: 'var(--pc-success)' },
};

export function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [balanceError, setBalanceError] = useState('');
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user?._id) {
      setLoadingBalance(false);
      return;
    }
    (async () => {
      try {
        const value = await getBalance(user._id);
        if (!cancelled) setBalance(value);
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setBalance(0);
        } else {
          setBalanceError('Could not load wallet balance.');
        }
      } finally {
        if (!cancelled) setLoadingBalance(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?._id]);

  const firstName = (user?.name || 'there').trim().split(/\s+/)[0];

  return (
    <AppShell>
      <header style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 32px', borderBottom: '1px solid var(--pc-border)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Good morning, {firstName}</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13.5, color: 'var(--pc-text-muted)' }}>Here's what's happening across your account today.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="pc-topbar-search" style={{ alignItems: 'center', gap: 8, background: 'var(--pc-surface-2)', border: '1px solid var(--pc-border-strong)', borderRadius: 12, padding: '0 13px', height: 44, width: 230, color: 'var(--pc-text-dim)' }}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <span style={{ fontSize: 14 }}>Search services…</span>
          </span>
          <Button variant="primary" icon={<Icon d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />}>Rent number</Button>
        </div>
      </header>

      <div style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
        <section className="pc-stat-grid">
          {STATS.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} accent={s.accent} icon={<Icon d={s.icon} color={s.accent} />} />
          ))}
        </section>

        <section style={{ background: 'var(--pc-surface-1)', border: '1px solid var(--pc-border)', borderRadius: 'var(--pc-radius-xl)', padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Buy a number</h2>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--pc-text-muted)' }}>Instant activation across 50+ countries — pay from your wallet.</p>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 999, background: 'var(--pc-success-bg)', color: 'var(--pc-success)', fontSize: 12.5, fontWeight: 600 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
              </svg>
              Instant activation
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {COUNTRIES.map((c) => (
              <button
                key={c.label}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 999,
                  border: `1px solid ${c.active ? 'var(--pc-accent)' : 'var(--pc-border-strong)'}`,
                  background: c.active ? 'var(--pc-accent)' : 'var(--pc-surface-2)',
                  color: c.active ? 'var(--pc-on-accent)' : 'var(--pc-text-muted)',
                  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {c.flag} {c.label}
              </button>
            ))}
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 999, border: '1px solid var(--pc-border-strong)', background: 'var(--pc-surface-2)', color: 'var(--pc-text-dim)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              +46 more
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {NUMBERS.map((n) => (
              <div key={n.number} className="pc-number-row" style={{ padding: '14px 4px', borderTop: '1px solid var(--pc-border)' }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{n.flag}</span>
                <div className="pc-number-row-meta" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--pc-font-mono)' }}>{n.number}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--pc-text-dim)', marginTop: 2 }}>{n.meta}</div>
                </div>
                <div className="pc-number-row-tail">
                  <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', ...TAG_COLORS[n.tagTone] }}>{n.tag}</span>
                  <span style={{ width: 96, textAlign: 'right', fontSize: 14.5, fontWeight: 700, fontFamily: 'var(--pc-font-mono)' }}>{n.price}</span>
                  <Button variant="secondary" size="sm">Buy</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pc-two-col">
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Active activations</h2>
              <a href="#" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--pc-text)', textDecoration: 'underline' }}>View all</a>
            </div>
            <div className="pc-activations-grid">
              {ACTIVATIONS.map((a) => (
                <NumberCard key={a.number} {...a} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            <WalletCard
              balance={loadingBalance ? 0 : (balance ?? 0)}
              footer={balanceError || (loadingBalance ? 'Loading balance…' : 'Last top-up ₦5,000 · 2 days ago')}
            />

            <div style={{ background: 'var(--pc-surface-1)', border: '1px solid var(--pc-border)', borderRadius: 'var(--pc-radius-xl)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent activity</h2>
                <a href="#" style={{ fontSize: 13, fontWeight: 600, color: 'var(--pc-text)', textDecoration: 'underline' }}>All</a>
              </div>
              {LEDGER.map((t, i) => (
                <TransactionRow key={i} {...t} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default Dashboard;
