'use client';
import { COLOR_MAP, COLOR_KEYS } from '../lib/constants';

export default function Ghost({ pos, name, message, colorKey, visible }) {
  if (!visible) return null;
  const bg = COLOR_MAP[colorKey]?.bg ?? COLOR_MAP.cream.bg;
  return (
    <div
      className="note ghost"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
        background: bg,
        opacity: 0.55,
        pointerEvents: 'none',
        zIndex: 99998,
        transition: 'background 0.18s ease',
      }}
    >
      <div className="note-name">{name || 'Your Name'}</div>
      <div className="note-message">{message || 'Your message…'}</div>
    </div>
  );
}
