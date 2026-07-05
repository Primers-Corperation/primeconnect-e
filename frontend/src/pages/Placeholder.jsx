import React from 'react';
import { AppShell } from '../components/AppShell.jsx';

export function Placeholder({ title }) {
  return (
    <AppShell>
      <header style={{ padding: '20px 32px', borderBottom: '1px solid var(--pc-border)' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>{title}</h1>
      </header>
      <div style={{ flex: 1, padding: '28px 32px' }}>
        <p style={{ fontSize: 14.5, color: 'var(--pc-text-muted)' }}>
          {title} isn't built yet — only the Dashboard was included in this design export.
        </p>
      </div>
    </AppShell>
  );
}

export default Placeholder;
