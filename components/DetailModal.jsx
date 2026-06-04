'use client';
import { useState, useEffect } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLOR_MAP, COLOR_KEYS, REACTIONS, VIEWED_KEY, REACT_KEY_PFX } from '../lib/constants';

function noteColorBg(note) {
  if (note?.colorKey && COLOR_MAP[note.colorKey]) return COLOR_MAP[note.colorKey].bg;
  if (typeof note?.style === 'number') return COLOR_MAP[COLOR_KEYS[note.style % COLOR_KEYS.length]].bg;
  return COLOR_MAP.cream.bg;
}

function getViewed() {
  try { return new Set(JSON.parse(sessionStorage.getItem(VIEWED_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveViewed(set) {
  try { sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...set])); } catch {}
}

export default function DetailModal({ note, open, onClose }) {
  const [reacted,  setReacted]  = useState({});
  const [bouncing, setBouncing] = useState(null);

  useEffect(() => {
    if (!open || !note) return;
    const r = {};
    REACTIONS.forEach((emoji) => {
      r[emoji] = !!sessionStorage.getItem(`${REACT_KEY_PFX}${note.id}_${emoji}`);
    });
    setReacted(r);
    const viewed = getViewed();
    if (!viewed.has(note.id)) {
      viewed.add(note.id);
      saveViewed(viewed);
      updateDoc(doc(db, 'notes', note.id), { views: increment(1) }).catch(() => {});
    }
  }, [open, note?.id]);

  async function handleReaction(emoji) {
    if (!note || reacted[emoji]) return;
    const key = `${REACT_KEY_PFX}${note.id}_${emoji}`;
    sessionStorage.setItem(key, '1');
    setReacted((p) => ({ ...p, [emoji]: true }));
    setBouncing(emoji);
    setTimeout(() => setBouncing(null), 400);
    try {
      await updateDoc(doc(db, 'notes', note.id), {
        [`reactions.${emoji}`]: increment(1),
      });
    } catch {
      sessionStorage.removeItem(key);
      setReacted((p) => ({ ...p, [emoji]: false }));
    }
  }

  // All variable derivation is inside the guard — no null crash
  const isOpen = open && !!note;
  const bg       = isOpen ? noteColorBg(note) : '#F5F1E8';
  const views    = isOpen ? (note.views || 0) : 0;
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
              const count = (note.reactions || {})[emoji] || 0;
              return (
                <button
                  key={emoji}
                  className={`reaction-btn${reacted[emoji] ? ' reacted' : ''}${bouncing === emoji ? ' reaction-bounce' : ''}`}
                  onClick={() => handleReaction(emoji)}
                  aria-label={`${emoji} reaction`}
                >
                  {emoji}
                  {count > 0 && <span className="reaction-count">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
                  
