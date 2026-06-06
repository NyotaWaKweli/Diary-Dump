'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Note } from '@/types';

export function SavedNotesPage({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notes/saved')
      .then(r => r.json())
      .then(data => {
        setNotes(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="h-6 w-6 text-accent" />
          <h1 className="text-3xl font-bold text-foreground font-serif">Saved Notes</h1>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-30">🔖</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No saved notes yet</h3>
            <p className="text-muted-foreground mb-4">Notes you save will appear here</p>
            <Link href="/" className="text-accent hover:underline inline-flex items-center gap-1">
              Browse spaces <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map(note => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-xl border border-border bg-card hover:shadow-note transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                    {note.author?.display_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-xs text-muted-foreground">{note.author?.display_name}</span>
                </div>
                {note.title && <h3 className="font-medium text-foreground mb-2">{note.title}</h3>}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{note.content}</p>
                <Link href={`/spaces/${note.space_id}`} className="text-xs text-accent hover:underline">
                  View in space →
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
