'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image, Send, Loader2 } from 'lucide-react';
import { NOTE_COLORS, generateRandomPosition } from '@/lib/utils';
import type { Note } from '@/types';

export function AddNoteModal({ spaceId, onClose, onSuccess }: {
  spaceId: string;
  onClose: () => void;
  onSuccess: (note: Note) => void;
}) {
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim()) && tags.length < 5) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  const handleSubmit = async () => {
    if (!content.trim()) { setError('Write something first'); return; }
    setLoading(true); setError('');
    try {
      const pos = generateRandomPosition();
      const formData = new FormData();
      formData.append('spaceId', spaceId);
      formData.append('content', content);
      formData.append('color', color);
      formData.append('tags', JSON.stringify(tags));
      formData.append('positionX', String(pos.x));
      formData.append('positionY', String(pos.y));
      formData.append('rotation', String(pos.rotation));
      if (image) formData.append('image', image);

      const res = await fetch('/api/notes', { method: 'POST', body: formData });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      const note = await res.json();
      onSuccess(note); onClose();
    } catch (err: any) { setError(err.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()} className="bg-background rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Add Note</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</motion.div>}
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your thoughts..." className="input-field min-h-[120px] resize-none font-hand text-base" maxLength={2000} autoFocus />
          <div className="text-right text-xs text-muted-foreground">{content.length}/2000</div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Note Color</label>
            <div className="flex gap-2">
              {NOTE_COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)} className={`w-10 h-10 rounded-lg ${c.bg} border-2 transition-all ${color === c.value ? 'border-accent scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} title={c.label} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type a tag and press Enter" className="input-field" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map(tag => <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">#{tag}<button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button></span>)}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Attach Image</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
            {preview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
                <button onClick={() => { setImage(null); setPreview(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-accent hover:text-accent transition-colors text-muted-foreground w-full justify-center"><Image className="h-5 w-5" /><span className="text-sm">Click to upload an image</span></button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !content.trim()} className="btn-primary flex items-center gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Posting...</> : <><Send className="h-4 w-4" />Post Note</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
