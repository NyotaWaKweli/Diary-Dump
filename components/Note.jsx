// components/Note.jsx
'use client';
import { useRef, useEffect, useState } from 'react';
import { COLOR_MAP, COLOR_KEYS, DRAG_THRESHOLD, REACTION_KEYS, REACTIONS } from '../lib/constants';

function noteColorBg(note) {
  if (note.colorKey && COLOR_MAP[note.colorKey]) return COLOR_MAP[note.colorKey].bg;
  // Legacy: numeric style field
  if (typeof note.style === 'number') {
    const key = COLOR_KEYS[note.style % COLOR_KEYS.length];
    return COLOR_MAP[key].bg;
  }
  return COLOR_MAP.cream.bg;
}

export default function Note({ note, scale, onTap }) {
  const pressRef  = useRef({ x: 0, y: 0, moved: false });
  const [appear, setAppear] = useState(false);

  // Trigger appear animation on first mount
  useEffect(() => {
    requestAnimationFrame(() => setAppear(true));
  }, []);

  function onPointerDown(e) {
    e.stopPropagation();
    pressRef.current = { x: e.clientX, y: e.clientY, moved: false };
  }
  function onPointerMove(e) {
    const dx = e.clientX - pressRef.current.x;
    const dy = e.clientY - pressRef.current.y;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      pressRef.current.moved = true;
    }
  }
  function onPointerUp(e) {
    e.stopPropagation();
    if (!pressRef.current.moved) onTap(note);
  }

  // Use safe key → emoji mapping so counts display correctly
  const reactionEntries = REACTIONS
    .map((emoji) => ({ emoji, count: (note.reactions || {})[REACTION_KEYS[emoji]] || 0 }))
    .filter(({ count }) => count > 0);

  return (
    <div
      className={`note${appear ? ' appear' : ''}`}
      style={{
        position: 'absolute',
        left: note.x,
        top: note.y,
        background: noteColorBg(note),
        '--r': `${note.rotation ?? 0}deg`,
        zIndex: Math.floor(note.y / 10) + 10,
        cursor: 'pointer',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="note-name">{note.name}</div>
      <div className="note-message">{note.message}</div>
      {note.for && <div className="note-for">For {note.for}</div>}
      <div className="note-date">{note.date}</div>
      {note.views > 0 && (
        <div className="note-views">👁 {note.views}</div>
      )}
      {reactionEntries.length > 0 && (
        <div className="note-reactions">
          {reactionEntries.map(({ emoji, count }) => (
            <span key={emoji} className="note-reaction-badge">
              {emoji} {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
