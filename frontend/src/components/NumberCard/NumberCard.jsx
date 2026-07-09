import React from 'react';
import { ServiceIcon } from '../ServiceIcon/ServiceIcon.jsx';
import { Badge } from '../Badge/Badge.jsx';

/**
 * Active virtual-number rental (activation). Shows the service, the
 * rented number, live status, and the received OTP code (or a waiting
 * state) with a copy affordance.
 */
export function NumberCard({
  service = 'WhatsApp', number = '', country = 'Nigeria',
  code = '', status = 'pending', price = 0, timeLeft = '',
  onCopy, onCancel, cancelDisabled = false,
}) {
  const waiting = !code;
  const naira = '\u20A6' + (Number(price) || 0).toLocaleString('en-NG');
  return (
    <div className="pc-card-hover" style={{
      background: 'var(--pc-surface-1)', border: '1px solid var(--pc-border)',
      borderRadius: 'var(--pc-radius-xl)', padding: 20, fontFamily: 'var(--pc-font-sans)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
        <ServiceIcon service={service} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--pc-text)' }}>{service}</div>
          <div style={{ fontSize: 13, color: 'var(--pc-text-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
            {country}<span style={{ opacity: 0.4 }}>·</span>{naira}
          </div>
        </div>
        <Badge tone={status} dot>{status}</Badge>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--pc-surface-2)', borderRadius: 'var(--pc-radius-md)',
        padding: '12px 15px', marginBottom: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--pc-text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Number</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--pc-text)', fontFamily: 'var(--pc-font-mono)', marginTop: 2 }}>{number}</div>
        </div>
        {timeLeft ? (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--pc-text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Expires</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--pc-warning)', fontFamily: 'var(--pc-font-mono)', marginTop: 2 }}>{timeLeft}</div>
          </div>
        ) : null}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        border: `1px dashed ${waiting ? 'var(--pc-border-strong)' : 'var(--pc-accent)'}`,
        borderRadius: 'var(--pc-radius-md)', padding: '14px 16px',
        background: waiting ? 'transparent' : 'color-mix(in srgb, var(--pc-accent) 16%, transparent)',
      }}>
        {waiting ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--pc-text-muted)', fontSize: 14 }}>
            <span style={{
              width: 14, height: 14, borderRadius: '50%',
              border: '2px solid var(--pc-border-strong)', borderTopColor: 'var(--pc-accent)',
              animation: 'pc-spin 0.7s linear infinite', display: 'inline-block',
            }} />
            Waiting for SMS code…
          </span>
        ) : (
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '.22em', color: 'var(--pc-text)', fontFamily: 'var(--pc-font-mono)' }}>
            {code}
          </span>
        )}
        {!waiting && onCopy ? (
          <button onClick={onCopy} style={{
            border: 'none', background: 'var(--pc-accent)', color: 'var(--pc-on-accent)', cursor: 'pointer',
            fontWeight: 700, fontSize: 13.5, padding: '8px 14px', borderRadius: 10, fontFamily: 'inherit',
          }}>Copy</button>
        ) : null}
      </div>

      {onCancel ? (
        <button disabled={cancelDisabled} onClick={onCancel} style={{
          marginTop: 14, width: '100%', border: '1px solid var(--pc-border-strong)', background: 'transparent',
          color: 'var(--pc-text-muted)', cursor: cancelDisabled ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13.5,
          opacity: cancelDisabled ? 0.6 : 1,
          padding: '10px', borderRadius: 10, fontFamily: 'inherit',
        }}>{cancelDisabled ? 'Cancelling...' : 'Cancel activation'}</button>
      ) : null}

      <style>{'@keyframes pc-spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}

export default NumberCard;
