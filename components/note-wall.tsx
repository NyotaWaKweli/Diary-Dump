'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, 
  ZoomIn, ZoomOut, Maximize2, Plus, Users, Eye, UserPlus, UserCheck
} from 'lucide-react';
import type { Space, Note } from '@/types';
import { AddNoteModal } from './add-note-modal';
import { NoteDetailModal } from './note-detail-modal';

interface NoteWallProps {
  space: Space;
  initialNotes: Note[];
  isMember: boolean;
  isFollowing: boolean;
  currentUserId?: string;
}

export function NoteWall({ space, initialNotes, isMember, isFollowing, currentUserId }: NoteWallProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [memberStatus, setMemberStatus] = useState(isMember);
  const [followStatus, setFollowStatus] = useState(isFollowing);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(s => Math.min(Math.max(s * delta, 0.3), 3));
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setIsPanning(true);
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const handleJoin = async () => {
    if (!currentUserId) { router.push('/login'); return; }
    const res = await fetch(`/api/spaces/${space.id}/join`, { method: 'POST' });
    const data = await res.json();
    setMemberStatus(data.member);
  };

  const handleFollow = async () => {
    if (!currentUserId) { router.push('/login'); return; }
    const res = await fetch(`/api/spaces/${space.id}/follow`, { method: 'POST' });
    const data = await res.json();
    setFollowStatus(data.following);
  };

  const handleLike = async (noteId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentUserId) { router.push('/login'); return; }
    
    const res = await fetch(`/api/notes/${noteId}/react`, { method: 'POST' });
    const data = await res.json();
    
    setNotes(prev => prev.map(n => 
      n.id === noteId ? { ...n, is_liked: data.liked, reaction_count: data.reaction_count } : n
    ));
  };

  const handleDoubleTap = (noteId: string) => {
    handleLike(noteId);
  };

  const handleSave = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) { router.push('/login'); return; }
    
    const res = await fetch(`/api/notes/${noteId}/save`, { method: 'POST' });
    const data = await res.json();
    
    setNotes(prev => prev.map(n => 
      n.id === noteId ? { ...n, is_saved: data.saved } : n
    ));
  };

  const handleRepost = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) { router.push('/login'); return; }
    // Repost logic - would open modal to select space
  };

  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden relative bg-navy-900">
      {/* HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="flex items-center justify-between p-4">
          <div className="pointer-events-auto">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Spaces
            </Link>
          </div>
          <div className="text-center pointer-events-auto">
            <h1 className="text-xl font-bold text-white font-serif drop-shadow-lg">{space.name}</h1>
            <div className="flex items-center justify-center gap-3 mt-1 text-xs text-white/60">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{space.visit_count}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{space.member_count}</span>
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{space.follower_count}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            {currentUserId && (
              <>
                <button
                  onClick={handleFollow}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    followStatus 
                      ? 'bg-accent/20 text-accent border border-accent/30' 
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Heart className={`h-3 w-3 ${followStatus ? 'fill-current' : ''}`} />
                  {followStatus ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={handleJoin}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    memberStatus
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {memberStatus ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                  {memberStatus ? 'Joined' : 'Join'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-2">
        <button onClick={() => setScale(s => Math.min(s * 1.3, 3))} className="tool-btn icon">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button onClick={() => setScale(s => Math.max(s * 0.7, 0.3))} className="tool-btn icon">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} className="tool-btn icon">
          <Maximize2 className="h-4 w-4" />
        </button>
        <div className="text-xs text-white/50 text-center font-mono">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Add Note Button */}
      {memberStatus && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="absolute bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:bg-accent-hover transition-colors"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      )}

      {/* Wall Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full cursor-grab ${isPanning ? 'cursor-grabbing' : ''}`}
        style={{ touchAction: 'none' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative w-[4000px] h-[4000px]"
          style={{ transform: transform, transformOrigin: '0 0', willChange: 'transform' }}
        >
          {/* Empty State */}
          {notes.length === 0 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-6xl mb-4 opacity-20">📝</div>
              <h3 className="text-xl font-serif text-white/30 mb-2">The wall is quiet</h3>
              <p className="text-sm text-white/20">Be the first to leave a note</p>
            </div>
          )}

          {/* Notes */}
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.35, rotate: note.rotation }}
                animate={{ opacity: 1, scale: 1, rotate: note.rotation }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="note-card group"
                style={{
                  left: `${note.position_x}%`,
                  top: `${note.position_y}%`,
                  backgroundColor: note.color_hex || note.color,
                  '--r': `${note.rotation}deg`,
                } as React.CSSProperties}
                onClick={() => setSelectedNote(note)}
                onDoubleClick={() => handleDoubleTap(note.id)}
              >
                {/* Note Header */}
                <div className="flex items-center gap-2 mb-2">
                  {note.author?.avatar_url ? (
                    <img src={note.author.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-xs font-bold text-black/40">
                      {note.author?.display_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="text-xs font-medium text-black/60 truncate max-w-[100px]">
                    {note.author?.display_name || 'Anonymous'}
                  </span>
                </div>

                {/* Title */}
                {note.title && (
                  <h4 className="text-sm font-bold text-black/80 mb-1 font-serif leading-tight">
                    {note.title}
                  </h4>
                )}

                {/* Content */}
                <p className="text-sm text-black/60 leading-relaxed line-clamp-5 font-hand">
                  {note.content}
                </p>

                {/* Image */}
                {note.image_url && (
                  <div className="mt-2 rounded overflow-hidden">
                    <img src={note.image_url} alt="" className="w-full h-20 object-cover" />
                  </div>
                )}

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between text-[10px] text-black/40">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleLike(note.id, e)}
                      className={`flex items-center gap-0.5 transition-colors ${
                        note.is_liked ? 'text-red-500' : 'hover:text-black/60'
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${note.is_liked ? 'fill-current animate-heart-burst' : ''}`} />
                      {note.reaction_count > 0 && note.reaction_count}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedNote(note); }}
                      className="flex items-center gap-0.5 hover:text-black/60"
                    >
                      <MessageCircle className="h-3 w-3" />
                      {note.comments?.length || 0}
                    </button>
                    <button
                      onClick={(e) => handleSave(note.id, e)}
                      className={`transition-colors ${note.is_saved ? 'text-amber-600' : 'hover:text-black/60'}`}
                    >
                      <Bookmark className={`h-3 w-3 ${note.is_saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <span>{formatRelativeTime(note.created_at)}</span>
                </div>

                {/* Repost Badge */}
                {note.original_author && (
                  <div className="absolute -top-2 -right-2 bg-accent text-white text-[9px] px-2 py-0.5 rounded-full">
                    Repost
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddNoteModal
            spaceId={space.id}
            onClose={() => setShowAddModal(false)}
            onSuccess={(note) => {
              setNotes(prev => [note, ...prev]);
              setShowAddModal(false);
            }}
          />
        )}
        {selectedNote && (
          <NoteDetailModal
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onLike={() => handleLike(selectedNote.id)}
            onSave={(e) => handleSave(selectedNote.id, e)}
            currentUserId={currentUserId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return 'now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
