'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Laugh, Frown, Flame, MessageCircle, Send, Trash2, Loader2 } from 'lucide-react';
import { getNoteColorClasses, formatRelativeTime } from '@/lib/utils';
import type { Note, Comment } from '@/types';
import { useAuth } from './providers';

export function NoteDetailModal({ note, onClose, onReact }: {
  note: Note;
  onClose: () => void;
  onReact: (type: string) => void;
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const colors = getNoteColorClasses(note.color);

  useEffect(() => {
    fetch(`/api/notes/${note.id}/comments`).then(r => r.json()).then(d => { if (d.comments) setComments(d.comments); }).catch(() => {});
  }, [note.id]);

  const addComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/notes/${note.id}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) { const c = await res.json(); setComments(prev => [...prev, c]); setNewComment(''); }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const deleteNote = async () => {
    if (!confirm('Delete this note permanently?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      if (res.ok) { onClose(); window.location.reload(); }
    } catch (e) { console.error(e); } finally { setDeleting(false); }
  };

  const isOwner = user?.id === note.author_id;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()} className="bg-background rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className={`${colors.bg} ${colors.text} p-6 relative`}>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2"><div className="w-5 h-5 rounded-full bg-red-500 shadow-md border-2 border-red-600" /></div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-hand text-xl font-bold leading-relaxed whitespace-pre-wrap">{note.content}</h3>
              {note.image_url && <div className="mt-4 rounded-lg overflow-hidden"><img src={note.image_url} alt="Note" className="w-full max-h-64 object-cover" /></div>}
              {note.tags && note.tags.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{note.tags.map(t => <span key={t} className="text-xs px-2 py-1 rounded-full bg-black/10 font-medium">#{t}</span>)}</div>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors ml-2"><X className="h-5 w-5" /></button>
          </div>
          <div className="flex items-center justify-between text-sm opacity-70">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-black/10 flex items-center justify-center"><span className="text-xs font-bold">{note.author?.display_name?.[0] || 'A'}</span></div>
              <span className="font-medium">{note.author?.display_name || 'Anonymous'}</span>
            </div>
            <span>{formatRelativeTime(note.created_at)}</span>
          </div>
        </div>
        <div className="px-6 py-3 border-b border-border flex items-center gap-4 flex-wrap">
          <ReactBtn icon={<Heart className="h-5 w-5" />} label="Heart" count={note.reactions_heart} onClick={() => onReact('heart')} />
          <ReactBtn icon={<Laugh className="h-5 w-5" />} label="Laugh" count={note.reactions_laugh} onClick={() => onReact('laugh')} />
          <ReactBtn icon={<Frown className="h-5 w-5" />} label="Sad" count={note.reactions_sad} onClick={() => onReact('sad')} />
          <ReactBtn icon={<Flame className="h-5 w-5" />} label="Fire" count={note.reactions_fire} onClick={() => onReact('fire')} />
          {isOwner && <button onClick={deleteNote} disabled={deleting} className="ml-auto p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 max-h-[300px]">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><MessageCircle className="h-4 w-4" />Comments ({comments.length})</h4>
          {comments.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p> : comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-accent">{c.author?.display_name?.[0] || 'A'}</span></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><span className="text-sm font-medium text-foreground">{c.author?.display_name || 'Anonymous'}</span><span className="text-xs text-muted-foreground">{formatRelativeTime(c.created_at)}</span></div>
                <p className="text-sm text-foreground/80">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex gap-2">
            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} placeholder="Write a comment..." className="input-field flex-1" />
            <button onClick={addComment} disabled={submitting || !newComment.trim()} className="btn-primary px-4">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ReactBtn({ icon, label, count, onClick }: { icon: React.ReactNode; label: string; count: number; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-accent/10 hover:text-accent transition-colors text-sm" title={label}>{icon}{count > 0 && <span className="font-medium">{count}</span>}</button>;
}
