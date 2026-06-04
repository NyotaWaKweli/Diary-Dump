import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

function formatDate(ts) {
  try {
    return ts?.toDate().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch {
    return 'Just now';
  }
}

function docToNote(docChange) {
  const d  = docChange.doc.data();
  const id = docChange.doc.id;
  return {
    id,
    x:        d.x        ?? 2000,
    y:        d.y        ?? 2000,
    name:     d.name     || 'Anonymous',
    message:  d.message  || '',
    for:      d.for      || '',
    colorKey: d.colorKey || null,
    style:    d.style    ?? 0,        // legacy compat
    rotation: d.rotation ?? 0,
    reactions: d.reactions || {},
    views:    d.views    || 0,
    date:     formatDate(d.createdAt),
  };
}

export function useNotes() {
  const [notes, setNotes]     = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'notes'),
      (snap) => {
        setLoading(false);
        setNotes((prev) => {
          const next = new Map(prev);
          snap.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const note = docToNote(change);
              // Preserve local x/y if note was being dragged
              const existing = next.get(note.id);
              if (existing?._dragging) {
                next.set(note.id, { ...note, x: existing.x, y: existing.y, _dragging: true });
              } else {
                next.set(note.id, note);
              }
            }
            if (change.type === 'removed') {
              next.delete(change.doc.id);
            }
          });
          return next;
        });
      },
      (err) => {
        setLoading(false);
        setError(err);
        console.error('[useNotes]', err);
      },
    );
    return unsub;
  }, []);

  return { notes, setNotes, loading, error };
                }

