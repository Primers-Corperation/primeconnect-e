import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell.jsx';
import { Button } from '../components/Button/Button.jsx';
import { StatCard } from '../components/StatCard/StatCard.jsx';
import { WalletCard } from '../components/WalletCard/WalletCard.jsx';
import { NumberCard } from '../components/NumberCard/NumberCard.jsx';
import { TransactionRow } from '../components/TransactionRow/TransactionRow.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { getWallet } from '../api/wallet.js';
import { getActivations, cancelActivation } from '../api/sms.js';
import { useActivationPolling } from '../hooks/useActivationPolling.js';

const CANCEL_WINDOW_MS = 15 * 60 * 1000;
function withinCancelWindow(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < CANCEL_WINDOW_MS;
}

function Icon({ d, color }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--pc-ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
      <path d={d} />
    </svg>
  );
}

function naira(n) {
  return '₦' + (Number(n) || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

const ICONS = {
  phone: 'M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013 5.18 2 2 0 015 3h3a2 2 0 012 1.72c.13 1 .37 2 .72 2.94a2 2 0 01-.45 2.11L8.09 11.9a16 16 0 006 6l1.13-1.18a2 2 0 012.11-.45c.94.35 1.94.59 2.94.72A2 2 0 0122 16.92z',
  wallet: 'M2 5h20v14H2zM2 10h20',
  arrowDown: 'M12 5v14M19 12l-7 7-7-7',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  bolt: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
};

function EmptyState({ title, body, action }) {
  return (
    <div className="pc-empty-state">
      <div className="pc-empty-state-title">{title}</div>
      <div className="pc-empty-state-body">{body}</div>
      {action ? <div style={{ marginTop: 20 }}>{action}</div> : null}
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [w, a] = await Promise.all([getWallet(), getActivations()]);
        if (cancelled) return;
        setWallet(w);
        setActivations(a);
      } catch (err) {
        if (!cancelled) setError('Could not load your dashboard. Please refresh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useActivationPolling(activations, setActivations);

  const handleCopy = (code) => {
    if (code) navigator.clipboard?.writeText(code);
  };

  const handleCancel = async (activation) => {
    try {
      await cancelActivation(activation._id);
      setActivations((prev) => prev.map((a) => (a._id === activation._id ? { ...a, status: 'cancelled' } : a)));
      const w = await getWallet();
      setWallet(w);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel this rental.');
    }
  };

  const firstName = (user?.name || 'there').trim().split(/\s+/)[0];
  const txns = wallet.transactions || [];
  const activeCount = activations.filter((a) => ['pending', 'active'].includes(a.status)).length;
  const totalIn = txns.filter((t) => t.type === 'deposit').reduce((s, t) => s + Math.abs(t.amount || 0), 0);
  const totalOut = txns.filter((t) => t.type !== 'deposit').reduce((s, t) => s + Math.abs(t.amount || 0), 0);

  const STATS = [
    { label: 'Wallet balance', value: naira(wallet.balance), icon: ICONS.wallet, accent: 'var(--pc-ink)' },
    { label: 'Active numbers', value: String(activeCount), icon: ICONS.phone, accent: 'var(--pc-ink)' },
    { label: 'Total funded', value: naira(totalIn), icon: ICONS.arrowDown, accent: 'var(--pc-success)' },
    { label: 'Total spent', value: naira(totalOut), icon: ICONS.arrowUp, accent: 'var(--pc-danger)' },
  ];

  return (
    <AppShell>
      <header className="pc-page-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>Welcome back, {firstName}</h1>
          <p>Here's what's happening across your account.</p>
        </div>
        <Button variant="primary" icon={<Icon d={ICONS.bolt} />} onClick={() => navigate('/rent-number')}>
          Rent number
        </Button>
      </header>

      <div className="pc-page-body pc-page-enter">
        {error ? (
          <div style={{ padding: '14px 18px', borderRadius: 'var(--pc-radius-lg)', background: 'var(--pc-danger-bg)', color: 'var(--pc-danger)', fontSize: 'var(--pc-text-sm)', fontWeight: 500 }}>
            {error}
          </div>
        ) : null}

        {/* Stats row */}
        <section className="pc-stat-grid">
          {STATS.map((s) => (
            <div key={s.label} className="pc-stat-card">
              <StatCard
                label={s.label}
                value={loading ? '—' : s.value}
                accent={s.accent}
                icon={<Icon d={s.icon} color={s.accent} />}
              />
            </div>
          ))}
        </section>

        {/* Main two-column layout */}
        <section className="pc-two-col pc-page-enter-delay">
          {/* Active numbers */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Active numbers</h2>
              <a
                onClick={() => navigate('/rent-number')}
                style={{ fontSize: 'var(--pc-text-sm)', fontWeight: 600, color: 'var(--pc-text)', cursor: 'pointer' }}
              >
                Rent new +
              </a>
            </div>
            {loading ? (
              <EmptyState title="Loading…" body="Fetching your rented numbers." />
            ) : activations.length === 0 ? (
              <EmptyState
                title="No active numbers yet"
                body="Rent a virtual number to receive SMS verification codes instantly."
                action={<Button variant="secondary" size="sm" onClick={() => navigate('/rent-number')}>Rent a number</Button>}
              />
            ) : (
              <div className="pc-activations-grid">
                {activations.slice(0, 6).map((a) => (
                  <NumberCard
                    key={a._id || a.activationId}
                    service={a.serviceName || a.service}
                    number={a.number}
                    country={a.country}
                    status={a.status}
                    price={a.cost || 0}
                    code={a.code}
                    onCopy={a.code ? () => handleCopy(a.code) : undefined}
                    onCancel={a.status === 'pending' && withinCancelWindow(a.createdAt) ? () => handleCancel(a) : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right column: wallet + recent activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            <div className="pc-wallet-card">
              <WalletCard
                balance={loading ? 0 : wallet.balance}
                footer={loading ? 'Loading balance…' : null}
                onTopUp={() => navigate('/wallet')}
                onWithdraw={() => navigate('/wallet')}
              />
            </div>

            <div style={{
              background: 'var(--pc-surface-1)',
              border: '1px solid var(--pc-border)',
              borderRadius: 'var(--pc-radius-xl)',
              padding: 'clamp(14px, 3vw, 22px)',
              animation: 'fadeUp 350ms 160ms ease both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 'var(--pc-text-lg)' }}>Recent activity</h2>
                {txns.length > 0 ? (
                  <a
                    onClick={() => navigate('/history')}
                    style={{ fontSize: 'var(--pc-text-sm)', fontWeight: 600, color: 'var(--pc-text)', cursor: 'pointer' }}
                  >
                    View all
                  </a>
                ) : null}
              </div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1,2,3].map(i => (
                    <div key={i} className="pc-skeleton" style={{ height: 44, borderRadius: 8 }} />
                  ))}
                </div>
              ) : txns.length === 0 ? (
                <p style={{ fontSize: 'var(--pc-text-sm)', color: 'var(--pc-text-muted)', padding: '8px 0', lineHeight: 1.6 }}>
                  No transactions yet. Top up your wallet to get started.
                </p>
              ) : (
                txns.slice(0, 5).map((t, i) => (
                  <TransactionRow
                    key={t._id || i}
                    type={t.type}
                    description={t.description}
                    date={formatDate(t.date)}
                    amount={t.amount}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default Dashboard;
