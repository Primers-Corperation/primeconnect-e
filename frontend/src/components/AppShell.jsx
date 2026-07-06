import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar } from './Avatar/Avatar.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

const NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  },
  {
    to: '/rent-number',
    label: 'Rent number',
    icon: 'M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013 5.18 2 2 0 015 3h3a2 2 0 012 1.72c.13 1 .37 2 .72 2.94a2 2 0 01-.45 2.11L8.09 11.9a16 16 0 006 6l1.13-1.18a2 2 0 012.11-.45c.94.35 1.94.59 2.94.72A2 2 0 0122 16.92z',
  },
  {
    to: '/marketplace',
    label: 'Marketplace',
    icon: 'M2 7h20v14H2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16',
  },
  {
    to: '/wallet',
    label: 'Wallet',
    icon: 'M2 5h20v14H2zM2 10h20',
  },
  {
    to: '/history',
    label: 'History',
    icon: 'M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z',
  },
  {
    to: '/support',
    label: 'Help & support',
    icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM9.09 9a3 3 0 015.83 1c0 2-3 2-3 4M12 17h.01',
  },
];

function NavIcon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--pc-bg)', color: 'var(--pc-text)', fontFamily: 'var(--pc-font-sans)' }}>
      <aside className="pc-sidebar" style={{ flexShrink: 0, background: 'var(--pc-surface-1)', borderRight: '1px solid var(--pc-border)', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 8px 26px' }}>
          <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 11, background: 'var(--pc-accent-grad)', boxShadow: 'var(--pc-glow-accent)', color: 'var(--pc-on-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0114 0M8.5 16.1a6 6 0 017 0M2 9a16 16 0 0120 0" />
              <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span className="pc-brand-label" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.02em', whiteSpace: 'nowrap' }}>PrimeConnect</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 12,
                  background: active ? 'var(--pc-accent)' : 'transparent',
                  color: active ? 'var(--pc-on-accent)' : 'var(--pc-text-muted)',
                  fontSize: 14.5, fontWeight: active ? 700 : 600, textDecoration: 'none',
                }}
              >
                <NavIcon d={item.icon} />
                <span className="pc-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link to="/settings" title="Settings" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 12, borderRadius: 14, background: 'var(--pc-surface-2)', border: '1px solid var(--pc-border)', textDecoration: 'none', color: 'inherit' }}>
            <Avatar name={user?.name || ''} size={38} />
            <div className="pc-user-text" style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Guest'}</div>
              <div style={{ fontSize: 12, color: 'var(--pc-text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ''}</div>
            </div>
          </Link>
          <button
            onClick={logout}
            style={{
              border: 'none', background: 'transparent', color: 'var(--pc-text-muted)', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, textAlign: 'left', padding: '4px 8px',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>{children}</main>
    </div>
  );
}

export default AppShell;
