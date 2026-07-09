import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell.jsx';
import { TransactionRow } from '../components/TransactionRow/TransactionRow.jsx';
import { getWallet } from '../api/wallet.js';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function History() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { transactions } = await getWallet();
        if (!cancelled) setTxns(transactions);
      } catch {
        if (!cancelled) setError('Could not load your history. Please refresh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AppShell>
      <header className="pc-page-header" style={{}}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>History</h1>
          <p style={{ margin: "4px 0 0" }}>Every deposit, purchase and withdrawal on your wallet.</p>
        </div>
      </header>

      <div className="pc-page-body pc-page-enter" style={{}}>
        <div style={{ maxWidth: 640, background: 'var(--pc-surface-1)', border: '1px solid var(--pc-border)', borderRadius: 'var(--pc-radius-xl)', padding: 20 }}>
          {loading ? (
            <p style={{ fontSize: 14, color: 'var(--pc-text-muted)' }}>Loading…</p>
          ) : error ? (
            <p style={{ fontSize: 14, color: 'var(--pc-danger)' }}>{error}</p>
          ) : txns.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--pc-text-muted)' }}>No transactions yet. Top up your wallet to get started.</p>
          ) : (
            txns.map((t, i) => (
              <TransactionRow key={t._id || i} type={t.type} description={t.description} date={formatDate(t.date)} amount={t.amount} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default History;
