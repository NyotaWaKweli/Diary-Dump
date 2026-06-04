// components/WriteModal.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLOR_KEYS, COLOR_MAP } from '../lib/constants';

export default function WriteModal({ open, pendingPos, onClose, onSuccess }) {
  const [name,    setName]    = useState('');
  const [forWho,  setForWho]  = useState('');
  const [message, setMessage] = useState('');
  const [color,   setColor]   = useState('cream');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]   = useState({});
  const nameRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName(''); setForWho(''); setMessage('');
      setColor('cream'); setErrors({});
      // Double rAF for iOS focus reliability
      requestAnimationFrame(() => requestAnimationFrame(() => nameRef.current?.focus()));
    }
  }, [open]);

  async function handleSubmit() {
    const errs = {};
    if (!name.trim())    errs.name    = 'Please enter your name';
    if (!message.trim()) errs.message = 'Please write a message';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'notes'), {
        x:         pendingPos.x,
        y:         pendingPos.y,
        name:      name.trim(),
        message:   message.trim(),
        for:       forWho.trim(),
        colorKey:  color,
        rotation:  (Math.random() - 0.5) * 5,
        reactions: {},
        views:     0,
        createdAt: serverTimestamp(),
      });
      onSuccess('Your note is on the wall ✦');
      onClose();
    } catch (err) {
      console.error('[WriteModal]', err);
      const msg = err.code === 'permission-denied'
        ? 'Blocked by security rules.'
        : !navigator.onLine
          ? "You're offline. Try again when connected."
          : 'Failed to place note. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`overlay${open ? ' visible' : ' hidden'}`} onPointerDown={(e) => { if (open && e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onPointerDown={(e) => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <h2>Write a Note</h2>
        <p className="modal-sub">Share a memory, a thought, or a tribute.</p>

        {/* Name */}
        <div className="field">
          <label htmlFor="wm-name">Your Name <span className="req">*</span></label>
          <input
            id="wm-name" ref={nameRef} type="text" maxLength={50}
            placeholder="Enter your name" value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
            className={errors.name ? 'input-error' : ''}
            autoComplete="off" spellCheck="false"
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        {/* For */}
        <div className="field">
          <label htmlFor="wm-for">This note is for <span className="opt">optional</span></label>
          <input
            id="wm-for" type="text" maxLength={50}
            placeholder="Who are you remembering?" value={forWho}
            onChange={(e) => setForWho(e.target.value)}
            autoComplete="off" spellCheck="false"
          />
        </div>

        {/* Colour */}
        <div className="field">
          <label>Note Colour</label>
          <div className="swatches" role="radiogroup">
            {COLOR_KEYS.map((key) => (
              <button
                key={key} type="button"
                className={`swatch swatch-${key}${color === key ? ' active' : ''}`}
                style={{ background: COLOR_MAP[key].bg, borderColor: COLOR_MAP[key].border }}
                onClick={() => setColor(key)}
                role="radio" aria-checked={color === key} aria-label={key}
              >
                {color === key && <span style={{ fontSize: '0.75rem', color: 'rgba(44,44,44,0.55)', fontWeight: 700 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="field">
          <label htmlFor="wm-msg">Your Message <span className="req">*</span></label>
          <textarea
            id="wm-msg" maxLength={500} rows={4}
            placeholder="Write your note here…" value={message}
            onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: '' })); }}
            className={errors.message ? 'input-error' : ''}
            spellCheck="false" autoComplete="off"
            onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit(); }}
          />
          <div className="field-footer">
            {errors.message
              ? <p className="field-error">{errors.message}</p>
              : <span />}
            <span className="char-count">{message.length}/500</span>
          </div>
        </div>

        {errors.submit && <p className="field-error" style={{ marginBottom: 10 }}>{errors.submit}</p>}

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Placing…' : 'Place on Wall'}
          </button>
        </div>

      </div>
    </div>
  );
          }
          
