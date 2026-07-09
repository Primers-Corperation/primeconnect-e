import React from 'react';

/**
 * PrimeConnect primary action button.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  icon = null,
  disabled = false,
  onClick,
  type = 'button',
  ...rest
}) {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 14, gap: 6, radius: 10, iconSize: 16 },
    md: { padding: '11px 18px', fontSize: 15, gap: 8, radius: 12, iconSize: 18 },
    lg: { padding: '15px 24px', fontSize: 16, gap: 10, radius: 14, iconSize: 20 },
  };
  const s = sizes[size] || sizes.md;

  const base = {
    display: full ? 'flex' : 'inline-flex',
    width: full ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    padding: s.padding,
    fontSize: s.fontSize,
    fontWeight: 700,
    fontFamily: 'var(--pc-font-sans)',
    lineHeight: 1,
    border: '1px solid transparent',
    borderRadius: s.radius,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'transform .12s ease, filter .15s ease, background .15s ease',
    whiteSpace: 'nowrap',
  };

  const variants = {
    primary: {
      background: 'var(--pc-accent-grad)',
      color: 'var(--pc-on-accent)',
      boxShadow: 'var(--pc-glow-accent)',
    },
    secondary: {
      background: 'var(--pc-surface-3)',
      color: 'var(--pc-text)',
      border: '1px solid var(--pc-border-strong)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--pc-text-muted)',
    },
    danger: {
      background: 'var(--pc-danger)',
      color: '#fff',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...(variants[variant] || variants.primary) }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {icon ? <span style={{ display: 'inline-flex', width: s.iconSize, height: s.iconSize }}>{icon}</span> : null}
      {children}
    </button>
  );
}

export default Button;
