import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell.jsx';
import { Card } from '../components/Card/Card.jsx';
import { Button } from '../components/Button/Button.jsx';
import { verifyTopup } from '../api/wallet.js';

function formatNaira(n) {
  return '₦' + (Number(n) || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function WalletCallback() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');
  const [state, setState] = useState({ status: 'verifying', balance: null, message: '' });

  useEffect(() => {
    let cancelled = false;
    if (!reference) {
      setState({ status: 'error', balance: null, message: 'Missing payment reference.' });
      return;
    }
    (async () => {
      try {
        const data = await verifyTopup(reference);
        if (cancelled) return;
        if (data.status === 'success') {
          setState({ status: 'success', balance: data.balance, message: '' });
        } else {
          setState({ status: 'pending', balance: null, message: data.message || 'Payment not completed yet.' });
        }
      } catch (err) {
        if (cancelled) return;
        setState({ status: 'error', balance: null, message: err.response?.data?.message || 'Could not verify payment.' });
      }
    })();
    return () => { cancelled = true; };
  }, [reference]);

  const COPY = {
    verifying: { title: 'Verifying payment…', body: 'Hold on while we confirm your top-up.' },
    success: { title: 'Top-up successful', body: `Your new balance is ${formatNaira(state.balance)}.` },
    pending: { title: 'Payment pending', body: state.message },
    error: { title: 'Verification failed', body: state.message },
  }[state.status];

  return (
    <AppShell>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Card padding={32} style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>{COPY.title}</h1>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--pc-text-muted)' }}>{COPY.body}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}><Button variant="secondary">Back to dashboard</Button></Link>
            <Link to="/wallet" style={{ textDecoration: 'none' }}><Button>Go to wallet</Button></Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

export default WalletCallback;
