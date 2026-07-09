import React, { useState, useEffect, useCallback } from 'react';
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

function NavIcon({ d, size = 19 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pc-nav-icon"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  // desktop: sidebar collapsed/expanded
  const [collapsed, setCollapsed] = useState(false);
  // mobile: drawer open/closed
  const [mobileOpen, setMobileOpen] = useState(false);
  // track mobile viewport
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 720;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Keyboard trap: close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileOpen]);

  const sidebarClasses = [
    'pc-sidebar',
    !isMobile && collapsed ? 'compact' : '',
    isMobile && mobileOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ');

  const showLabels = isMobile ? true : !collapsed;

  return (
    <div className="pc-shell" style={{ fontFamily: 'var(--pc-font-sans)', color: 'var(--pc-text)' }}>
      {/* Mobile overlay */}
      {isMobile && (
        <div
          className={`pc-overlay${mobileOpen ? ' visible' : ''}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={sidebarClasses} aria-label="Main navigation">

        {/* Brand */}
        <div className="pc-brand">
          <span style={{
            width: 38, height: 38, flexShrink: 0,
            borderRadius: 11,
            background: '#000000',
            boxShadow: 'var(--pc-glow-accent)',
            color: '#ffffff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
              strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0114 0M8.5 16.1a6 6 0 017 0M2 9a16 16 0 0120 0" />
              <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
            </svg>
          </span>
          {showLabels && (
            <span className="pc-brand-label">PrimeConnect</span>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }} role="navigation">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                aria-current={active ? 'page' : undefined}
                className={`pc-nav-link${active ? ' active' : ''}`}
              >
                <NavIcon d={item.icon} />
                {showLabels && (
                  <span className="pc-nav-label">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: collapse toggle + user + sign out */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Collapse toggle — standard inline button */}
          {!isMobile && (
            <>
              <div className="pc-sidebar-divider" />
              <button
                className="pc-sidebar-collapse-btn"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <span className={`pc-sidebar-collapse-icon${collapsed ? ' rotated' : ''}`}>
                  <ChevronLeftIcon />
                </span>
              </button>
            </>
          )}
          <Link
            to="/settings"
            title="Settings"
            className="pc-user-card"
          >
            <Avatar name={user?.name || ''} size={36} />
            {showLabels && (
              <div className="pc-user-text" style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 'var(--pc-text-sm)', fontWeight: 700,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {user?.name || 'Guest'}
                </div>
                <div style={{
                  fontSize: 'var(--pc-text-xs)', color: 'var(--pc-text-dim)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {user?.email || ''}
                </div>
              </div>
            )}
          </Link>
          <button className="pc-sign-out-btn" onClick={logout}>
            {showLabels ? 'Sign out' : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="pc-main">
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderBottom: '1px solid var(--pc-border)',
            background: 'var(--pc-surface-1)', position: 'sticky', top: 0, zIndex: 100,
          }}>
            <button
              className="pc-hamburger"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
            <span style={{
              fontSize: 'var(--pc-text-base)', fontWeight: 800,
              fontFamily: 'var(--pc-font-display)', letterSpacing: '-0.02em',
            }}>
              PrimeConnect
            </span>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}

export default AppShell;
