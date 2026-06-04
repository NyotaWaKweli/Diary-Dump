'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { doc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { WALL_SIZE } from '../lib/constants';
import { useNotes }  from '../hooks/useNotes';
import { useCamera } from '../hooks/useCamera';
import { useToast }  from '../hooks/useToast';
import Note         from './Note';
import Ghost        from './Ghost';
import HUD          from './HUD';
import WriteModal   from './WriteModal';
import DetailModal  from './DetailModal';
import Toast        from './Toast';

export default function Wall() {
  const { notes, loading, error } = useNotes();
  const { camera, initView, zoomAround, getViewportHandlers } = useCamera();
  const { toasts, addToast } = useToast();

  const [mode,       setMode]       = useState('navigate'); // 'navigate' | 'place'
  const [ghostPos,   setGhostPos]   = useState({ x: 0, y: 0 });
  const [ghostVisible, setGhostVisible] = useState(false);
  const [pendingPos, setPendingPos] = useState({ x: 0, y: 0 });
  const [modalOpen,  setModalOpen]  = useState(false);
  const [detailNote, setDetailNote] = useState(null);
  const [viewCount,  setViewCount]  = useState('—');
  const [panning,    setPanning]    = useState(false);

  const viewportRef = useRef(null);

  // Init camera on mount
  useEffect(() => { initView(); }, [initView]);

  // Track global view count (meta/stats doc)
  useEffect(() => {
    const ref = doc(db, 'meta', 'stats');
    updateDoc(ref, { views: increment(1) }).catch(() => {});
    const unsub = onSnapshot(ref, (snap) => {
      const v = snap.data()?.views ?? 0;
      setViewCount(v > 999 ? (v / 1000).toFixed(1) + 'k' : String(v));
    }, () => {});
    return unsub;
  }, []);

  // Show error toast once
  useEffect(() => {
    if (error) addToast('Connection error. Some notes may not load.', 'error');
  }, [error]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        if (modalOpen)      { setModalOpen(false); exitPlaceMode(); }
        else if (detailNote){ setDetailNote(null); }
        else if (mode === 'place') exitPlaceMode();
      }
      if (e.key === '+' || e.key === '=') zoomAround(camera.scale * 1.2, window.innerWidth / 2, window.innerHeight / 2);
      if (e.key === '-')                  zoomAround(camera.scale * 0.83, window.innerWidth / 2, window.innerHeight / 2);
      if (e.key === '0' || e.key === 'r') initView();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, detailNote, mode, camera.scale, zoomAround, initView]);

  // Online / offline toasts
  useEffect(() => {
    const onOffline = () => addToast("You're offline", 'error');
    const onOnline  = () => addToast('Back online ✓', 'success');
    window.addEventListener('offline', onOffline);
    window.addEventListener('online',  onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online',  onOnline);
    };
  }, [addToast]);

  // Ghost follows pointer in place mode
  const handlePointerMoveGlobal = useCallback((e) => {
    if (mode === 'place') {
      setGhostPos({ x: e.clientX, y: e.clientY });
      setGhostVisible(true);
    }
  }, [mode]);

  function enterPlaceMode() {
    setMode('place');
    setGhostVisible(false);
  }
  function exitPlaceMode() {
    setMode('navigate');
    setGhostVisible(false);
  }
  function toggleMode() {
    mode === 'place' ? exitPlaceMode() : enterPlaceMode();
  }

  // Tap handler — called by useCamera when no drag happened
  function handleTap(e) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    // Taps on .note are handled by Note component's own pointerUp
    if (target?.closest('.note')) return;
    // Taps on HUD buttons are handled by HUD
    if (target?.closest('.hud'))  return;

    if (mode === 'place') {
      // Convert screen coords → wall coords
      const wx = (e.clientX - camera.tx) / camera.scale;
      const wy = (e.clientY - camera.ty) / camera.scale;
      setPendingPos({ x: wx, y: wy });
      setModalOpen(true);
      setGhostVisible(false);
    }
  }

  const rawHandlers = getViewportHandlers({
    onTap: handleTap,
    disabled: modalOpen || !!detailNote,
  });

  // Wrap pointer handlers to track panning cursor state
  const vpHandlers = {
    ...rawHandlers,
    onPointerDown(e) {
      setPanning(true);
      rawHandlers.onPointerDown?.(e);
    },
    onPointerUp(e) {
      setPanning(false);
      rawHandlers.onPointerUp?.(e);
    },
    onPointerCancel(e) {
      setPanning(false);
      rawHandlers.onPointerCancel?.(e);
    },
  };

  const wallTransform = `translate3d(${camera.tx.toFixed(1)}px,${camera.ty.toFixed(1)}px,0) scale(${camera.scale.toFixed(5)})`;

  return (
    <>
      {/* Viewport */}
      <div
        ref={viewportRef}
        className={`viewport${mode === 'place' ? ' placing' : panning ? ' panning' : ''}`}
        onPointerMove={handlePointerMoveGlobal}
        onPointerLeave={() => setGhostVisible(false)}
        style={{ touchAction: 'none' }}
        {...vpHandlers}
      >
        <div className="wall" style={{ transform: wallTransform }}>
          {/* Empty state */}
          {!loading && notes.size === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h3>The wall is quiet</h3>
              <p>Be the first to leave a note</p>
            </div>
          )}

          {/* Loading shimmer dots */}
          {loading && (
            <div className="wall-loading">
              <div className="wall-spinner" />
            </div>
          )}

          {/* Notes */}
          {[...notes.values()].map((note) => (
            <Note
              key={note.id}
              note={note}
              scale={camera.scale}
              onTap={(n) => { if (mode === 'navigate') setDetailNote(n); }}
            />
          ))}
        </div>
      </div>

      {/* Ghost preview */}
      <Ghost
        pos={ghostPos}
        visible={ghostVisible && mode === 'place' && !modalOpen}
        colorKey="cream"
      />

      {/* HUD */}
      <HUD
        mode={mode}
        noteCount={notes.size}
        viewCount={viewCount}
        scale={camera.scale}
        onAddClick={toggleMode}
        onZoomIn={() => zoomAround(camera.scale * 1.3, window.innerWidth / 2, window.innerHeight / 2)}
        onZoomOut={() => zoomAround(camera.scale * 0.7, window.innerWidth / 2, window.innerHeight / 2)}
        onReset={initView}
      />

      {/* Modals */}
      <WriteModal
        open={modalOpen}
        pendingPos={pendingPos}
        onClose={() => { setModalOpen(false); exitPlaceMode(); }}
        onSuccess={(msg) => addToast(msg, 'success')}
      />
      <DetailModal
        note={detailNote}
        open={!!detailNote}
        onClose={() => setDetailNote(null)}
      />

      {/* Toasts */}
      <Toast toasts={toasts} />
    </>
  );
}

