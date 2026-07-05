import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell.jsx';
import { Card } from '../components/Card/Card.jsx';
import { WalletCard } from '../components/WalletCard/WalletCard.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { Button } from '../components/Button/Button.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { getBalance, initializeTopup } from '../api/wallet.js';

const PRESETS = [500, 1000, 2000, 5000];

export function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user?._id) return;
    (async () => {
      try {
        const value = await getBalance(user._id);
        if (!cancelled) setBalance(value);
      } catch (err) {
        if (!cancelled) setBalance(err.response?.status === 404 ? 0 : null);
      }
    })();
    return () => { cancelled = true; };
  }, [user?._id]);

  const handleTopUp = async (e) => {
    e.preventDefault();
    setError('');
    const value = Number(amount);
    if (!value || value < 100) {
      setError('Enter an amount of at least ₦100.');
      return;
    }
    setLoading(true);
    try {
      const { authorization_url } = await initializeTopup(value);
      // Hand off to Paystack's hosted checkout.
      window.location.assign(authorization_url);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors?.length
          ? errors.map((x) => x.message).join(', ')
          : err.response?.data?.message || 'Could not start payment. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <header style={{ padding: '20px 32px', borderBottom: '1px solid var(--pc-border)' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Wallet</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13.5, color: 'var(--pc-text-muted)' }}>Top up your Naira balance to rent numbers and buy accounts.</p>
      </header>

      <div style={{ flex: 1, padding: '28px 32px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start', maxWidth: 820 }}>
        <WalletCard balance={balance ?? 0} footer={balance === null ? 'Could not load balance' : null} />

        <Card padding={24}>
          <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Add funds</h2>
          <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--pc-text-muted)' }}>Pay securely with Paystack.</p>
          <form onSubmit={handleTopUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  style={{
                    padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 13.5, fontWeight: 600,
                    border: `1px solid ${Number(amount) === p ? 'var(--pc-accent)' : 'var(--pc-border-strong)'}`,
                    background: Number(amount) === p ? 'var(--pc-accent)' : 'var(--pc-surface-2)',
                    color: Number(amount) === p ? 'var(--pc-on-accent)' : 'var(--pc-text-muted)',
                  }}
                >
                  ₦{p.toLocaleString('en-NG')}
                </button>
              ))}
            </div>
            <TextField
              label="Amount (₦)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              min="100"
            />
            {error ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{error}</div> : null}
            <Button type="submit" full disabled={loading}>{loading ? 'Redirecting…' : 'Top up with Paystack'}</Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

export default Wallet;
