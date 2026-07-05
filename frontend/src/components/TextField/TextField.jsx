import React from 'react';

/**
 * Labeled text field with optional leading icon, hint, and error.
 */
export function TextField({
  label, value, onChange, placeholder, type = 'text',
  icon = null, hint = '', error = '', disabled = false, full = true, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const borderColor = error ? 'var(--pc-danger)' : focus ? 'var(--pc-accent)' : 'var(--pc-border-strong)';
  return (
    <label style={{ display: 'block', width: full ? '100%' : 'auto', fontFamily: 'var(--pc-font-sans)' }}>
      {label ? (
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--pc-text-muted)', marginBottom: 7 }}>
          {label}
        </span>
      ) : null}
      <span style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--pc-surface-2)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--pc-radius-md)',
        padding: '0 14px', height: 46,
        boxShadow: focus ? '0 0 0 3px rgba(139,92,246,0.18)' : 'none',
        transition: 'border-color .15s ease, box-shadow .15s ease',
        opacity: disabled ? 0.55 : 1,
      }}>
        {icon ? <span style={{ display: 'inline-flex', width: 18, height: 18, color: 'var(--pc-text-dim)', flexShrink: 0 }}>{icon}</span> : null}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--pc-text)', fontSize: 15, fontFamily: 'inherit', height: '100%',
          }}
          {...rest}
        />
      </span>
      {error ? (
        <span style={{ display: 'block', fontSize: 12.5, color: '#f87171', marginTop: 6 }}>{error}</span>
      ) : hint ? (
        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--pc-text-dim)', marginTop: 6 }}>{hint}</span>
      ) : null}
    </label>
  );
}

export default TextField;
