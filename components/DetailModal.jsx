// components/DetailModal.jsx
'use client';
import { useState, useEffect } from 'react';
import { COLOR_MAP, COLOR_KEYS, REACTIONS, REACTION_KEYS, REACTION_EMOJIS } from '../lib/constants';

function noteColorBg(note) {
  if (note?.colorKey && COLOR_MAP[note.colorKey]) return COLOR_MAP[note.colorKey].bg;
  if (typeof note?.style === 'number') return COLOR_MAP[COLOR_KEYS[note.style % COLOR_KEYS.length]].bg;
  return COLOR_MAP.cream.bg;
}

export default function DetailModal({ note, open, onClose }) {
  const [reacted,  setReacted]  = useState({});   // emoji → bool
  const [bouncing, setBouncing] = useState(null);
  const [views,    setViews]    = useState(0);
  const [reactions, setReactions] = useState({});  // reactionKey → count

  const isOpen = open && !!note;

  // On open: call /api/view (IP-deduped), seed reaction counts from note
  useEffect(() => {
    if (!isOpen) return;

    // Seed counts from Firestore data immediately
    setReactions(note.reactions || {});
    setViews(note.views || 0);

    // Restore which emojis this browser already reacted with
    // (belt-and-suspenders on top of IP check)
    const r = {};
    REACTIONS.forEach((emoji) => {
      const key = REACTION_KEYS[emoji];
      r[emoji] = !!localStorage.getItem(`dd_reacted_${note.id}_${key}`);
    });
    setReacted(r);

    // Call view API — server handles IP dedup
    fetch('/api/view', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ noteId: note.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.views === 'number') setViews(data.views);
      })
      .catch(() => {}); // non-critical

  }, [isOpen, note?.id]);

  async function handleReaction(emoji) {
    if (!note || reacted[emoji]) return;
    const reactionKey = REACTION_KEYS[emoji];
    if (!reactionKey) return;

    // Optimistic update
    setReacted((p) => ({ ...p, [emoji]: true }));
    setReactions((p) => ({ ...p, [reactionKey]: (p[reactionKey] || 0) + 1 }));
    setBouncing(emoji);
    setTimeout(() => setBouncing(null), 400);

    try {
      const res  = await fetch('/api/react', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ noteId: note.id, emoji }),
      });
      const data = await res.json();

      if (data.alreadyReacted) {
        // Server says already reacted from this IP — rollback optimistic
        setReacted((p) => ({ ...p, [emoji]: true })); // keep it marked
        setReactions((p) => ({ ...p, [reactionKey]: Math.max(0, (p[reactionKey] || 1) - 1) }));
        return;
      }

      if (!data.success) throw new Error(data.error);

      // Persist locally so same browser doesn't re-react
      localStorage.setItem(`dd_reacted_${note.id}_${reactionKey}`, '1');

    } catch {
      // Rollback on network error
      setReacted((p) => ({ ...p, [emoji]: false }));
      setReactions((p) => ({ ...p, [reactionKey]: Math.max(0, (p[reactionKey] || 1) - 1) }));
    }
  }

  const bg       = isOpen ? noteColorBg(note) : '#F5F1E8';
  const rotation = isOpen ? (note.rotation ?? 0) : 0;

  return (
    <div
      className={`overlay${isOpen ? ' visible' : ' hidden'}`}
      onPointerDown={(e) => { if (isOpen && e.target === e.currentTarget) onClose(); }}
    >
      {isOpen && (
        <div
          className="detail-card"
          style={{ background: bg, '--r': `${rotation}deg` }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button className="detail-close" onClick={onClose} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div className="detail-name">{note.name}</div>
          <div className="detail-message">{note.message}</div>
          {note.for && <div className="detail-for">For {note.for}</div>}

          <div className="detail-meta">
            <span className="detail-date">{note.date}</span>
            {views > 0 && (
              <span className="detail-seen">👁 Seen by {views}</span>
            )}
          </div>

          <div className="reactions">
            {REACTIONS.map((emoji) => {
              const key   = REACTION_KEYS[emoji];
              const count = reactions[key] || 0;
              return (
                <button
                  key={emoji}
                  className={`reaction-btn${reacted[emoji] ? ' reacted' : ''}${bouncing === emoji ? ' reaction-bounce' : ''}`}
                  onClick={() => handleReaction(emoji)}
                  aria-label={`${emoji} reaction`}
                  title={reacted[emoji] ? 'Already reacted' : ''}
                >
                  {emoji}
                  {count > 0 && (
                    <span className="reaction-count">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
