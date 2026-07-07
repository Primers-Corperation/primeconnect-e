import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell.jsx';
import { Card } from '../components/Card/Card.jsx';
import { Button } from '../components/Button/Button.jsx';
import { Badge } from '../components/Badge/Badge.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { ServiceIcon } from '../components/ServiceIcon/ServiceIcon.jsx';
import { NumberCard } from '../components/NumberCard/NumberCard.jsx';
import { getCatalog, rentNumber, getSupportedCountries, getActivationStatus, cancelActivation } from '../api/sms.js';

function naira(n) {
  return '₦' + (Number(n) || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

const CANCEL_WINDOW_MS = 15 * 60 * 1000;
function withinCancelWindow(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < CANCEL_WINDOW_MS;
}

const RANGES = [
  { label: 'All prices', min: undefined, max: undefined },
  { label: 'Under ₦500', min: undefined, max: 500 },
  { label: '₦500 – ₦1,000', min: 500, max: 1000 },
  { label: '₦1,000 – ₦2,000', min: 1000, max: 2000 },
  { label: 'Over ₦2,000', min: 2000, max: undefined },
];

export function RentNumber() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('19'); // Nigeria default
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [range, setRange] = useState(RANGES[0]);
  const [renting, setRenting] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    getSupportedCountries().then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    const handle = setTimeout(() => {
      getCatalog({ country, minPrice: range.min, maxPrice: range.max, search })
        .then((list) => { if (!cancelled) setItems(list); })
        .catch(() => { if (!cancelled) setLoadError('Could not load the catalog. Please try again.'); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, search ? 300 : 0); // small debounce while typing a search term
    return () => { cancelled = true; clearTimeout(handle); };
  }, [country, range, search]);

  // Poll the just-rented number for its real status/OTP code.
  useEffect(() => {
    if (!result || result.status !== 'pending') return undefined;
    const interval = setInterval(async () => {
      try {
        const updated = await getActivationStatus(result._id);
        setResult((prev) => (prev ? { ...prev, ...updated } : prev));
      } catch {
        // transient error — retry next tick
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [result?._id, result?.status]);

  const handleRent = async (item) => {
    setError('');
    setResult(null);
    setRenting(item.service);
    try {
      const activation = await rentNumber({ service: item.service, country });
      setResult({ ...activation, displayName: item.name });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not rent a number. Please try again.');
    } finally {
      setRenting(null);
    }
  };

  const handleCopy = (code) => {
    if (code) navigator.clipboard?.writeText(code);
  };

  const handleCancel = async () => {
    if (!result || cancelling) return;
    setError('');
    setCancelling(true);
    try {
      await cancelActivation(result._id);
      setResult((prev) => (prev ? { ...prev, status: 'cancelled' } : prev));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel this rental.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AppShell>
      <header style={{ padding: '20px 32px', borderBottom: '1px solid var(--pc-border)' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Rent a number</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13.5, color: 'var(--pc-text-muted)' }}>Instant activation, priced live in Naira.</p>
      </header>

      <div style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ minWidth: 200 }}>
            <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. WhatsApp, Netflix…" />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--pc-text-muted)', marginBottom: 7 }}>Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{
                height: 46, borderRadius: 'var(--pc-radius-md)', border: '1px solid var(--pc-border-strong)',
                background: 'var(--pc-surface-2)', color: 'var(--pc-text)', fontSize: 15, fontFamily: 'inherit', padding: '0 12px',
              }}
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r)}
              style={{
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 600,
                border: `1px solid ${range.label === r.label ? 'var(--pc-accent)' : 'var(--pc-border-strong)'}`,
                background: range.label === r.label ? 'var(--pc-accent)' : 'var(--pc-surface-2)',
                color: range.label === r.label ? 'var(--pc-on-accent)' : 'var(--pc-text-muted)',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {error ? <div style={{ padding: 12, borderRadius: 12, background: 'var(--pc-danger-bg)', color: 'var(--pc-danger)', fontSize: 14 }}>{error}</div> : null}

        {result ? (
          <div style={{ maxWidth: 340 }}>
            <NumberCard
              service={result.displayName || result.service}
              number={result.number}
              country="Nigeria"
              status={result.status}
              price={result.cost || 0}
              code={result.code}
              onCopy={result.code ? () => handleCopy(result.code) : undefined}
              onCancel={result.status === 'pending' && withinCancelWindow(result.createdAt) ? handleCancel : undefined}
              cancelDisabled={cancelling}
            />
          </div>
        ) : null}

        {loading ? (
          <p style={{ fontSize: 14, color: 'var(--pc-text-muted)' }}>Loading real-time prices…</p>
        ) : loadError ? (
          <p style={{ fontSize: 14, color: 'var(--pc-danger)' }}>{loadError}</p>
        ) : items.length === 0 ? (
          <div style={{ border: '1px dashed var(--pc-border-strong)', borderRadius: 'var(--pc-radius-xl)', padding: '32px 24px', textAlign: 'center', color: 'var(--pc-text-muted)' }}>
            No numbers available for this search right now.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {items.map((item) => (
              <Card key={item.service} padding={20}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <ServiceIcon service={item.icon} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{item.name}</div>
                    <Badge tone="success" size="sm">in stock</Badge>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--pc-font-mono)' }}>{naira(item.priceNgn)}</span>
                  <Button size="sm" disabled={renting === item.service} onClick={() => handleRent(item)}>
                    {renting === item.service ? 'Renting…' : 'Rent'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default RentNumber;
