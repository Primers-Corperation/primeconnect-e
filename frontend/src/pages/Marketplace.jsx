import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell.jsx';
import { Card } from '../components/Card/Card.jsx';
import { Badge } from '../components/Badge/Badge.jsx';
import { ServiceIcon } from '../components/ServiceIcon/ServiceIcon.jsx';
import { Button } from '../components/Button/Button.jsx';
import { getAvailableAccounts, purchaseAccount } from '../api/accounts.js';

function naira(n) {
  return '₦' + (Number(n) || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

export function Marketplace() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [buyingId, setBuyingId] = useState(null);

  const load = async () => {
    try {
      const list = await getAvailableAccounts();
      setAccounts(list);
    } catch {
      setError('Could not load the marketplace. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBuy = async (account) => {
    setNotice('');
    setError('');
    setBuyingId(account._id);
    try {
      await purchaseAccount(account._id);
      setNotice(`Purchased ${account.service}. Check your account details.`);
      setAccounts((prev) => prev.filter((a) => a._id !== account._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed. Please try again.');
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <AppShell>
      <header className="pc-page-header" style={{}}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0 }}>Marketplace</h1>
          <p style={{ margin: "4px 0 0" }}>Ready-made accounts you can buy from your wallet.</p>
        </div>
      </header>

      <div className="pc-page-body pc-page-enter" style={{ display: "flex", flexDirection: "column", gap: "clamp(12px,2vw,20px)" }}>
        {notice ? <div style={{ padding: 12, borderRadius: 12, background: 'var(--pc-success-bg)', color: 'var(--pc-success)', fontSize: 14 }}>{notice}</div> : null}
        {error ? <div style={{ padding: 12, borderRadius: 12, background: 'var(--pc-danger-bg)', color: 'var(--pc-danger)', fontSize: 14 }}>{error}</div> : null}

        {loading ? (
          <p style={{ fontSize: 14, color: 'var(--pc-text-muted)' }}>Loading marketplace…</p>
        ) : accounts.length === 0 ? (
          <div style={{ border: '1px dashed var(--pc-border-strong)', borderRadius: 'var(--pc-radius-xl)', padding: '32px 24px', textAlign: 'center', color: 'var(--pc-text-muted)' }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--pc-text)' }}>No accounts available</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Check back soon — new listings appear here when they're in stock.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {accounts.map((a) => (
              <Card key={a._id} padding={20}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <ServiceIcon service={a.service} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{a.service}</div>
                    <Badge tone="available" size="sm">available</Badge>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--pc-font-mono)' }}>{naira(a.price)}</span>
                  <Button size="sm" disabled={buyingId === a._id} onClick={() => handleBuy(a)}>{buyingId === a._id ? 'Buying…' : 'Buy'}</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default Marketplace;
