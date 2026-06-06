'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, MessageCircle, Bookmark, Share2, Eye, Clock, Send } from 'lucide-react';
import type { Note, Comment } from '@/types';
import { formatRelativeTime, formatDate } from '@/lib/utils';

interface NoteDetailModalProps {
  note: Note;
  onClose: () => void;
  onLike: () => void;
  onSave: (e: React.MouseEvent) => void;
  currentUserId?: string;
}

export function NoteDetailModal({ note, onClose, onLike, onSave, currentUserId }: NoteDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>(note.comments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/notes/${note.id}/comments`)
      .then(r => r.json())
      .then(setComments);
  }, [note.id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId) return;
    setLoading(true);
    
    const res = await fetch(`/api/notes/${note.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment.trim() }),
    });
    
    if (res.ok) {
      const comment = await res.json();
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#F5F1E8] rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
        style={{ transform: `rotate(${note.rotation * 0.3}deg)` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <div className="flex items-center gap-3">
            {note.author?.avatar_url ? (
              <img src={note.author.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-sm font-bold text-black/40">
                {note.author?.display_name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <div className="text-sm font-semibold text-black/80">{note.author?.display_name || 'Anonymous'}</div>
              <div className="text-xs text-black/40 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(note.created_at)}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5">
            <X className="h-5 w-5 text-black/60" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Repost Badge */}
          {note.original_author && (
            <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-full w-fit">
              <Share2 className="h-3 w-3" />
              Reposted from {note.original_author.display_name}
            </div>
          )}

          {/* Title */}
          {note.title && (
            <h2 className="text-2xl font-bold text-black/80 font-serif">{note.title}</h2>
          )}

          {/* Content */}
          <p className="text-lg text-black/70 leading-relaxed font-hand whitespace-pre-wrap">
            {note.content}
          </p>

          {/* Image */}
          {note.image_url && (
            <img src={note.image_url} alt="" className="w-full rounded-lg shadow-md" />
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-black/40 py-3 border-y border-black/10">
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{note.view_count} views</span>
            <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{note.reaction_count} likes</span>
            <span className="flex items-center gap-1"><Bookmark className="h-4 w-4" />{note.save_count} saves</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                note.is_liked ? 'bg-red-50 text-red-500' : 'bg-black/5 text-black/60 hover:bg-black/10'
              }`}
            >
              <Heart className={`h-5 w-5 ${note.is_liked ? 'fill-current' : ''}`} />
              {note.is_liked ? 'Liked' : 'Like'}
            </button>
            <button
              onClick={onSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                note.is_saved ? 'bg-amber-50 text-amber-600' : 'bg-black/5 text-black/60 hover:bg-black/10'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${note.is_saved ? 'fill-current' : ''}`} />
              {note.is_saved ? 'Saved' : 'Save'}
            </button>
          </div>

          {/* Comments */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-black/60">Comments ({comments.length})</h3>
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-black/5">
                <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold text-black/40 flex-shrink-0">
                  {comment.author?.display_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="text-xs font-medium text-black/70">{comment.author?.display_name || 'Anonymous'}</div>
                  <div className="text-sm text-black/60 mt-0.5">{comment.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment Input */}
        {currentUserId && (
          <div className="p-4 border-t border-black/10 bg-black/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-black/10 bg-white text-black/80 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E]"
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                className="p-2.5 rounded-lg bg-[#C9A96E] text-white hover:bg-[#A08050] transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
