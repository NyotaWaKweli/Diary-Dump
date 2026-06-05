'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Globe, Loader2 } from 'lucide-react';
import { generateSlug } from '@/lib/utils';

export function CreateSpaceModal({ onClose, onSuccess }: {
  onClose: () => void;
  onSuccess: (space: any) => void;
}) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Space name required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/spaces', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password: password || undefined, isPublic }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      const space = await res.json();
      onSuccess(space); onClose();
    } catch (err: any) { setError(err.message || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()} className="bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Create Your Space</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</motion.div>}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Space Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., My Secret Diary" className="input-field" maxLength={50} autoFocus />
            <p className="text-xs text-muted-foreground mt-1">URL: /spaces/{generateSlug(name || 'my-space')}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Visibility</label>
            <div className="flex gap-3">
              <button onClick={() => setIsPublic(true)} className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${isPublic ? 'border-accent bg-accent/5 text-accent' : 'border-border hover:border-muted-foreground'}`}><Globe className="h-5 w-5" /><div className="text-left"><div className="text-sm font-medium">Public</div><div className="text-xs opacity-60">Anyone can view</div></div></button>
              <button onClick={() => setIsPublic(false)} className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${!isPublic ? 'border-accent bg-accent/5 text-accent' : 'border-border hover:border-muted-foreground'}`}><Lock className="h-5 w-5" /><div className="text-left"><div className="text-sm font-medium">Private</div><div className="text-xs opacity-60">Password protected</div></div></button>
            </div>
          </div>
          {!isPublic && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><label className="text-sm font-medium text-foreground mb-2 block">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="input-field" minLength={4} /></motion.div>}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !name.trim()} className="btn-primary flex items-center gap-2">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : 'Create Space'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
