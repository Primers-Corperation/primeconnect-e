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
      <header className="pc-page-header" style={{}}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0 }}>Rent a number</h1>
          <p style={{ margin: "4px 0 0" }}>Instant activation, priced live in Naira.</p>
        </div>
      </header>

      <div className="pc-page-body pc-page-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', width: '100%', maxWidth: 580 }}>
          <div style={{ flex: '2 1 240px' }}>
            <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. WhatsApp, Netflix…" />
          </div>
          <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--pc-text-muted)', marginBottom: 7 }}>Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="pc-select"
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r)}
              className={`pc-chip${range.label === r.label ? ' active' : ''}`}
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
          <div className="pc-catalog-grid">
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
