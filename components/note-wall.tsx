'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote } from './sticky-note';
import { NoteDetailModal } from './note-detail-modal';
import { AddNoteModal } from './add-note-modal';
import { Plus } from 'lucide-react';
import type { Note, Space } from '@/types';

export function NoteWall({ space, initialNotes }: { space: Space; initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel(`space-${space.id}`);
    channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'new-note') setNotes(prev => [data, ...prev]);
      else if (type === 'update-note') setNotes(prev => prev.map(n => n.id === data.id ? { ...n, ...data } : n));
      else if (type === 'delete-note') setNotes(prev => prev.filter(n => n.id !== data.id));
    };
    return () => channel.close();
  }, [space.id]);

  const handleAddNote = useCallback((newNote: Note) => {
    setNotes(prev => [newNote, ...prev]);
    const channel = new BroadcastChannel(`space-${space.id}`);
    channel.postMessage({ type: 'new-note', data: newNote });
    channel.close();
  }, [space.id]);

  const handleReact = useCallback(async (noteId: string, type: string) => {
    try {
      const res = await fetch(`/api/notes/${noteId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const { reactions } = await res.json();
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...reactions } : n));
      }
    } catch (e) { console.error('React failed:', e); }
  }, []);

  const getPos = (note: Note, index: number): React.CSSProperties => {
    if (note.position_x !== 0) {
      return { position: 'absolute', left: `${note.position_x}px`, top: `${note.position_y}px` };
    }
    const cols = 4;
    const col = index % cols;
    const row = Math.floor(index / cols);
    return {
      position: 'absolute',
      left: `${col * 220 + 20 + (Math.sin(index * 1.5) * 30)}px`,
      top: `${row * 240 + 20 + (Math.cos(index * 2.3) * 20)}px`,
    };
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <div className="cork-texture dark:cork-texture-dark wall-background dark:wall-background-dark min-h-[calc(100vh-64px)] relative overflow-hidden">
        <div className="relative z-10 px-6 py-4">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-foreground">{space.name}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm text-muted-foreground mt-1">{notes.length} {notes.length === 1 ? 'note' : 'notes'} pinned to this wall</motion.p>
        </div>
        <div className="relative px-6 pb-32" style={{ minHeight: '600px' }}>
          <AnimatePresence mode="popLayout">
            {notes.map((note, i) => (
              <motion.div key={note.id} layout style={getPos(note, i)} exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}>
                <StickyNote note={note} index={i} onClick={() => setSelectedNote(note)} onReact={(type) => handleReact(note.id, type)} />
              </motion.div>
            ))}
          </AnimatePresence>
          {notes.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg font-medium text-muted-foreground">No notes yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Be the first to pin something here!</p>
              </div>
            </motion.div>
          )}
        </div>
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddOpen(true)} className="fixed bottom-8 right-8 z-30 flex items-center gap-2 px-6 py-4 bg-accent text-white rounded-full shadow-lg hover:bg-accent-hover transition-colors">
          <Plus className="h-5 w-5" /><span className="font-medium hidden sm:inline">Add note</span>
        </motion.button>
      </div>
      <AnimatePresence>
        {selectedNote && <NoteDetailModal note={selectedNote} onClose={() => setSelectedNote(null)} onReact={(type) => handleReact(selectedNote.id, type)} />}
        {isAddOpen && <AddNoteModal spaceId={space.id} onClose={() => setIsAddOpen(false)} onSuccess={handleAddNote} />}
      </AnimatePresence>
    </div>
  );
}
