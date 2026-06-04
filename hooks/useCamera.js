import { useRef, useState, useCallback, useEffect } from 'react';
import { SCALE_MIN, SCALE_MAX, WALL_SIZE, DRAG_THRESHOLD } from '../lib/constants';

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export function useCamera() {
  const [camera, setCamera] = useState({ scale: 0.25, tx: 0, ty: 0 });
  const cameraRef = useRef(camera);

  // Keep ref in sync so event handlers always see current value
  useEffect(() => { cameraRef.current = camera; }, [camera]);

  const initView = useCallback(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const scale = clamp(Math.min(vw, vh) / WALL_SIZE * 0.9, 0.15, 0.4);
    const tx = (vw - WALL_SIZE * scale) / 2;
    const ty = (vh - WALL_SIZE * scale) / 2;
    setCamera({ scale, tx, ty });
  }, []);

  const zoomAround = useCallback((newScale, cx, cy) => {
    setCamera((prev) => {
      const s  = clamp(newScale, SCALE_MIN, SCALE_MAX);
      const wx = (cx - prev.tx) / prev.scale;
      const wy = (cy - prev.ty) / prev.scale;
      return { scale: s, tx: cx - wx * s, ty: cy - wy * s };
    });
  }, []);

  // Active pointer tracking for pinch
  const activePointers = useRef(new Map());
  const panState       = useRef(null);
  const pinchState     = useRef(null);

  function pointerDist() {
    const pts = [...activePointers.current.values()];
    return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  }
  function pointerCenter() {
    const pts = [...activePointers.current.values()];
    return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
  }

  // Returns handlers to spread onto the viewport element
  const getViewportHandlers = useCallback(({ onTap, disabled }) => ({
    onPointerDown(e) {
      if (disabled) return;
      if (e.button !== undefined && e.button !== 0) return;
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.current.size === 2) {
        // Start pinch
        panState.current = null;
        const c = cameraRef.current;
        const center = pointerCenter();
        pinchState.current = {
          dist0:   pointerDist(),
          scale0:  c.scale,
          wallX:   (center.x - c.tx) / c.scale,
          wallY:   (center.y - c.ty) / c.scale,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
      }

      // Single pointer — pan
      panState.current = {
        pointerId: e.pointerId,
        x0:    e.clientX,
        y0:    e.clientY,
        tx0:   cameraRef.current.tx,
        ty0:   cameraRef.current.ty,
        moved: false,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },

    onPointerMove(e) {
      if (disabled) return;
      if (activePointers.current.has(e.pointerId)) {
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Pinch zoom
      if (pinchState.current && activePointers.current.size === 2) {
        const p = pinchState.current;
        const dist   = pointerDist();
        const center = pointerCenter();
        const s = clamp(p.scale0 * (dist / p.dist0), SCALE_MIN, SCALE_MAX);
        setCamera({
          scale: s,
          tx: center.x - p.wallX * s,
          ty: center.y - p.wallY * s,
        });
        return;
      }

      // Pan
      const ps = panState.current;
      if (!ps || e.pointerId !== ps.pointerId) return;
      const dx = e.clientX - ps.x0;
      const dy = e.clientY - ps.y0;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) ps.moved = true;
      setCamera((prev) => ({ ...prev, tx: ps.tx0 + dx, ty: ps.ty0 + dy }));
    },

    onPointerUp(e) {
      if (disabled) return;
      const ps = panState.current;
      const moved = ps?.moved ?? false;
      activePointers.current.delete(e.pointerId);
      if (activePointers.current.size < 2) pinchState.current = null;
      if (ps?.pointerId === e.pointerId) panState.current = null;

      if (!moved) onTap?.(e);
    },

    onPointerCancel(e) {
      activePointers.current.delete(e.pointerId);
      if (activePointers.current.size < 2) pinchState.current = null;
      panState.current = null;
    },

    onWheel(e) {
      if (disabled) return;
      e.preventDefault();
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 18;
      if (e.deltaMode === 2) delta *= 300;
      const factor = delta > 0 ? 0.92 : 1.08;
      zoomAround(cameraRef.current.scale * factor, e.clientX, e.clientY);
    },
  }), [zoomAround]);

  return { camera, initView, zoomAround, getViewportHandlers };
      }
          
