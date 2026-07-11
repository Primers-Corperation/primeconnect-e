import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell.jsx';
import { Card } from '../components/Card/Card.jsx';
import { WalletCard } from '../components/WalletCard/WalletCard.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { Button } from '../components/Button/Button.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { getBalance, initializeTopup, quoteTopup } from '../api/wallet.js';
import { getBanks, resolveAccount, submitWithdrawal } from '../api/withdrawal.js';

const PRESETS = [500, 1000, 2000, 5000];
const MIN_WITHDRAWAL = 1000;

export function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [mode, setMode] = useState('topup'); // 'topup' | 'withdraw'

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [chargedAmount, setChargedAmount] = useState(null);

  const [banks, setBanks] = useState([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifiedFor, setVerifiedFor] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const refreshBalance = async () => {
    if (!user?._id) return;
    try {
      const value = await getBalance(user._id);
      setBalance(value);
    } catch (err) {
      setBalance(err.response?.status === 404 ? 0 : null);
    }
  };

  useEffect(() => { refreshBalance(); }, [user?._id]);

  useEffect(() => {
    if (mode === 'withdraw' && banks.length === 0) {
      getBanks().then(setBanks).catch(() => {});
    }
  }, [mode]);

  useEffect(() => {
    const value = Number(amount);
    if (!value || value < 100) {
      setChargedAmount(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      quoteTopup(value).then((v) => { if (!cancelled) setChargedAmount(v); }).catch(() => { if (!cancelled) setChargedAmount(null); });
    }, 350);
    return () => { cancelled = true; clearTimeout(t); };
  }, [amount]);

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

  const pairKey = `${accountNumber}:${bankCode}`;
  const isVerified = verifiedFor === pairKey && accountName;

  const handleVerify = async () => {
    setWithdrawError('');
    setAccountName('');
    setVerifiedFor('');
    if (!/^\d{10}$/.test(accountNumber) || !bankCode) {
      setWithdrawError('Enter a valid 10-digit account number and select a bank.');
      return;
    }
    setVerifying(true);
    try {
      const name = await resolveAccount({ accountNumber, bankCode });
      setAccountName(name);
      setVerifiedFor(pairKey);
    } catch (err) {
      setWithdrawError(err.response?.data?.message || 'Could not verify this account.');
    } finally {
      setVerifying(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');
    const value = Number(withdrawAmount);
    if (!isVerified) {
      setWithdrawError('Verify the account before withdrawing.');
      return;
    }
    if (!value || value < MIN_WITHDRAWAL) {
      setWithdrawError(`Enter an amount of at least ₦${MIN_WITHDRAWAL.toLocaleString('en-NG')}.`);
      return;
    }
    if (balance != null && value > balance) {
      setWithdrawError('Amount exceeds your wallet balance.');
      return;
    }
    setWithdrawing(true);
    try {
      const result = await submitWithdrawal({ amount: value, accountNumber, bankCode });
      setWithdrawSuccess(result.message || 'Your withdrawal is being processed.');
      setWithdrawAmount('');
      setAccountNumber('');
      setBankCode('');
      setAccountName('');
      setVerifiedFor('');
      await refreshBalance();
    } catch (err) {
      setWithdrawError(err.response?.data?.message || 'Could not process your withdrawal. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <AppShell>
      <header style={{ padding: '20px 32px', borderBottom: '1px solid var(--pc-border)' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Wallet</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13.5, color: 'var(--pc-text-muted)' }}>Top up or withdraw your Naira balance.</p>
      </header>

      <div style={{ flex: 1, padding: '28px 32px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start', maxWidth: 820 }}>
        <WalletCard
          balance={balance ?? 0}
          footer={balance === null ? 'Could not load balance' : null}
          onTopUp={() => setMode('topup')}
          onWithdraw={() => setMode('withdraw')}
        />

        <Card padding={24}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <button
              onClick={() => setMode('topup')}
              style={{
                padding: '6px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                border: `1px solid ${mode === 'topup' ? 'var(--pc-accent)' : 'var(--pc-border-strong)'}`,
                background: mode === 'topup' ? 'var(--pc-accent)' : 'transparent',
                color: mode === 'topup' ? 'var(--pc-on-accent)' : 'var(--pc-text-muted)',
              }}
            >
              Add funds
            </button>
            <button
              onClick={() => setMode('withdraw')}
              style={{
                padding: '6px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                border: `1px solid ${mode === 'withdraw' ? 'var(--pc-accent)' : 'var(--pc-border-strong)'}`,
                background: mode === 'withdraw' ? 'var(--pc-accent)' : 'transparent',
                color: mode === 'withdraw' ? 'var(--pc-on-accent)' : 'var(--pc-text-muted)',
              }}
            >
              Withdraw
            </button>
          </div>

          {mode === 'topup' ? (
            <form onSubmit={handleTopUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ margin: '0 0 2px', fontSize: 13, color: 'var(--pc-text-muted)' }}>Pay securely with Paystack.</p>
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
              <TextField label="Amount (₦)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" min="100" />
              {chargedAmount != null ? (
                <div style={{ fontSize: 13, color: 'var(--pc-text-muted)' }}>
                  You'll be charged <strong>₦{chargedAmount.toLocaleString('en-NG')}</strong> on Paystack (covers processing fees) — ₦{Number(amount).toLocaleString('en-NG')} lands in your wallet.
                </div>
              ) : null}
              {error ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{error}</div> : null}
              <Button type="submit" full disabled={loading}>{loading ? 'Redirecting…' : 'Top up with Paystack'}</Button>
            </form>
          ) : (
            <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ margin: '0 0 2px', fontSize: 13, color: 'var(--pc-text-muted)' }}>Minimum withdrawal ₦{MIN_WITHDRAWAL.toLocaleString('en-NG')}.</p>

              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--pc-text-muted)', marginBottom: 7 }}>Bank</span>
                <select
                  value={bankCode}
                  onChange={(e) => { setBankCode(e.target.value); setAccountName(''); setVerifiedFor(''); }}
                  style={{
                    width: '100%', height: 46, borderRadius: 'var(--pc-radius-md)', border: '1px solid var(--pc-border-strong)',
                    background: 'var(--pc-surface-2)', color: 'var(--pc-text)', fontSize: 15, fontFamily: 'inherit', padding: '0 12px',
                  }}
                >
                  <option value="">Select your bank…</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </label>

              <TextField
                label="Account number"
                value={accountNumber}
                onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setAccountName(''); setVerifiedFor(''); }}
                placeholder="0123456789"
              />

              {isVerified ? (
                <div style={{ padding: 12, borderRadius: 12, background: 'var(--pc-success-bg)', color: 'var(--pc-success)', fontSize: 13.5, fontWeight: 600 }}>
                  Verified: {accountName}
                </div>
              ) : (
                <Button type="button" variant="secondary" full disabled={verifying} onClick={handleVerify}>
                  {verifying ? 'Verifying…' : 'Verify account'}
                </Button>
              )}

              <TextField
                label="Amount (₦)"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={String(MIN_WITHDRAWAL)}
                min={MIN_WITHDRAWAL}
              />

              {withdrawError ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{withdrawError}</div> : null}
              {withdrawSuccess ? <div style={{ fontSize: 13, color: 'var(--pc-success)' }}>{withdrawSuccess}</div> : null}

              <Button type="submit" full disabled={!isVerified || withdrawing}>
                {withdrawing ? 'Processing…' : 'Withdraw'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

export default Wallet;
