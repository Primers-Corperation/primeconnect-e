import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, WifiOff, RefreshCw } from 'lucide-react';

function formatNaira(n) {
  const num = Number(n) || 0;
  return '\u20A6' + num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function useAnimatedNumber(target, duration = 600) {
  const [display, setDisplay] = useState(target);
  const raf = useRef(null);
  useEffect(() => {
    const start = display;
    const diff = target - start;
    if (!diff) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setDisplay(Math.round(start + diff * p));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return display;
}

export function WalletCard({
  balance = 0, label = 'Wallet balance',
  onTopUp, onWithdraw, footer = null,
  loading = false, error = false, retrying = false, onRetry,
}) {
  const [visible, setVisible] = useState(() => localStorage.getItem('pc_bal_vis') !== '0');
  const animatedBalance = useAnimatedNumber(balance);

  const toggleVisibility = () => {
    const next = !visible;
    setVisible(next);
    localStorage.setItem('pc_bal_vis', next ? '1' : '0');
  };

  const btn = (primary) => ({
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '11px 16px', fontSize: 14.5, fontWeight: 700, borderRadius: 'var(--pc-radius-md)', cursor: 'pointer',
    fontFamily: 'var(--pc-font-sans)',
    border: primary ? '1px solid var(--pc-ink)' : '1px solid color-mix(in srgb, var(--pc-on-accent) 40%, transparent)',
    background: primary ? 'var(--pc-ink)' : 'color-mix(in srgb, var(--pc-on-accent) 12%, transparent)',
    color: primary ? '#fff' : 'var(--pc-on-accent)',
  });

  // Skeleton loading state
  if (loading) {
    return (
      <div className="pc-wallet-card pc-wallet-card--loading">
        <div className="pc-wallet-card__orb" />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, opacity: 0.8 }}>{label}</div>
          <div style={{ height: 42, margin: '8px 0 20px', borderRadius: 8, background: 'rgba(255,255,255,0.15)', width: '60%' }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ flex: 1, height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.1)' }} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pc-wallet-card">
        <div className="pc-wallet-card__orb" />
        <div style={{ position: 'relative', textAlign: 'center', padding: '12px 0' }}>
          <WifiOff size={28} style={{ opacity: 0.7, marginBottom: 8 }} />
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>Could not load balance</div>
          {onRetry && (
            <button onClick={onRetry} style={{ ...btn(true), flex: 'none', padding: '9px 20px', fontSize: 13 }}>
              <RefreshCw size={14} className={retrying ? 'pc-spin-icon' : ''} />
              {retrying ? 'Retrying…' : 'Retry'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pc-wallet-card">
      <div className="pc-wallet-card__orb" />
      <div style={{ position: 'relative' }} className="pc-wallet-card__fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, opacity: 0.8, letterSpacing: '.02em' }}>{label}</div>
          <button onClick={toggleVisibility} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7, padding: 4 }}>
            {visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        <div style={{ fontSize: 'clamp(28px, 8vw, 42px)', fontWeight: 700, letterSpacing: '-.02em', margin: '8px 0 20px', fontFamily: 'var(--pc-font-display)', whiteSpace: 'nowrap' }}>
          {visible ? formatNaira(animatedBalance) : '₦••••••'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onTopUp} style={btn(true)}>Top up</button>
          <button onClick={onWithdraw} style={btn(false)}>Withdraw</button>
        </div>
        {footer ? <div style={{ marginTop: 16, fontSize: 13, opacity: 0.85 }}>{footer}</div> : null}
      </div>
    </div>
  );
}

export default WalletCard;
