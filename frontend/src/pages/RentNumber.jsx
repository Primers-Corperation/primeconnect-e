import React, { useState } from 'react';
import { AppShell } from '../components/AppShell.jsx';
import { Card } from '../components/Card/Card.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { Button } from '../components/Button/Button.jsx';
import { NumberCard } from '../components/NumberCard/NumberCard.jsx';
import { rentNumber } from '../api/sms.js';

export function RentNumber() {
  const [service, setService] = useState('');
  const [country, setCountry] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRent = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!service.trim() || !country.trim()) {
      setError('Enter both a service and a country code.');
      return;
    }
    setLoading(true);
    try {
      const activation = await rentNumber({ service: service.trim(), country: country.trim() });
      setResult(activation);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not rent a number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <header style={{ padding: '20px 32px', borderBottom: '1px solid var(--pc-border)' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Rent a number</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13.5, color: 'var(--pc-text-muted)' }}>Rent a virtual number to receive an SMS verification code.</p>
      </header>

      <div style={{ flex: 1, padding: '28px 32px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start', maxWidth: 820 }}>
        <Card padding={24}>
          <form onSubmit={handleRent} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField
              label="Service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. wa (WhatsApp), tg (Telegram)"
              hint="GrizzlySMS service code"
            />
            <TextField
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. 19 (Nigeria)"
              hint="GrizzlySMS country code"
            />
            {error ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{error}</div> : null}
            <Button type="submit" full disabled={loading}>{loading ? 'Renting…' : 'Rent number'}</Button>
          </form>
        </Card>

        {result ? (
          <NumberCard
            service={result.service}
            number={result.number}
            country={result.country}
            status={result.status}
            price={result.cost || 0}
          />
        ) : (
          <Card padding={24}>
            <p style={{ fontSize: 13.5, color: 'var(--pc-text-muted)', margin: 0 }}>
              Your rented number will appear here. It stays active while it waits for an incoming SMS code.
            </p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

export default RentNumber;
