import React from 'react';

const PALETTE = ['#8b5cf6', '#6366f1', '#ec4899', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444'];
function hashHue(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}
function initials(name) {
  const parts = (name || '').trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]).join('').toUpperCase() || '?';
}

/**
 * User avatar. Renders an image if `src` is given, otherwise a
 * deterministic colored initials chip.
 */
export function Avatar({ name = '', src = '', size = 40 }) {
  const bg = hashHue(name);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%', overflow: 'hidden',
      background: src ? 'transparent' : bg, color: '#fff',
      fontSize: size * 0.4, fontWeight: 700, fontFamily: 'var(--pc-font-sans)',
      flexShrink: 0, userSelect: 'none',
    }}>
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials(name)}
    </span>
  );
}

export default Avatar;
