import React from 'react';

/**
 * Surface container. The base building block for panels, list items,
 * and dashboard tiles. Optional accent-glow border.
 */
export function Card({ children, padding = 24, glow = false, interactive = false, style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--pc-surface-1)',
        border: `1px solid ${glow ? 'var(--pc-border-strong)' : 'var(--pc-border)'}`,
        borderRadius: 'var(--pc-radius-xl)',
        padding,
        boxShadow: glow ? 'var(--pc-glow-accent)' : 'var(--pc-shadow-sm)',
        transition: 'transform .15s ease, border-color .15s ease, box-shadow .15s ease',
        transform: interactive && hover ? 'translateY(-2px)' : 'none',
        borderColor: interactive && hover ? 'var(--pc-border-strong)' : undefined,
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
