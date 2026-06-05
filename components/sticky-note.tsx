'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Laugh, Frown, Flame, MessageCircle } from 'lucide-react';
import { getNoteColorClasses, formatRelativeTime, truncateText } from '@/lib/utils';
import type { Note } from '@/types';

export function StickyNote({ note, onClick, onReact, index = 0 }: {
  note: Note;
  onClick?: () => void;
  onReact?: (type: string) => void;
  index?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = getNoteColorClasses(note.color);
  const rotation = note.rotation || (Math.random() - 0.5) * 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.9, rotate: rotation - 5 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: rotation }}
      transition={{ duration: 0.5, delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 50, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`${colors.bg} ${colors.text} sticky-note w-[200px] min-h-[160px] max-h-[280px] flex flex-col justify-between cursor-pointer select-none dark:shadow-note-dark`}
      style={{ transformOrigin: 'center center' }}
    >
      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
        <div className="w-4 h-4 rounded-full bg-red-500 shadow-md border-2 border-red-600" />
      </div>
      <div className="pt-3 flex-1 overflow-hidden">
        <p className="text-sm leading-relaxed font-hand whitespace-pre-wrap break-words">{truncateText(note.content, 140)}</p>
        {note.image_url && (
          <div className="mt-2 rounded overflow-hidden">
            <img src={note.image_url} alt="Note" className="w-full h-20 object-cover" loading="lazy" />
          </div>
        )}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags.map((tag) => <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 font-medium">#{tag}</span>)}
          </div>
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-black/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] opacity-60 font-medium">{note.author?.display_name || 'Anonymous'}</span>
          <span className="text-[10px] opacity-50">{formatRelativeTime(note.created_at)}</span>
        </div>
        <motion.div initial={false} animate={{ opacity: isHovered ? 1 : 0.7 }} className="flex items-center gap-2 mt-1.5">
          <ReactionBtn icon={<Heart className="h-3 w-3" />} count={note.reactions_heart} onClick={(e) => { e.stopPropagation(); onReact?.('heart'); }} />
          <ReactionBtn icon={<Laugh className="h-3 w-3" />} count={note.reactions_laugh} onClick={(e) => { e.stopPropagation(); onReact?.('laugh'); }} />
          <ReactionBtn icon={<Frown className="h-3 w-3" />} count={note.reactions_sad} onClick={(e) => { e.stopPropagation(); onReact?.('sad'); }} />
          <ReactionBtn icon={<Flame className="h-3 w-3" />} count={note.reactions_fire} onClick={(e) => { e.stopPropagation(); onReact?.('fire'); }} />
          {note.comments_count !== undefined && note.comments_count > 0 && (
            <div className="flex items-center gap-0.5 text-[10px] opacity-60 ml-auto"><MessageCircle className="h-3 w-3" />{note.comments_count}</div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function ReactionBtn({ icon, count, onClick }: { icon: React.ReactNode; count: number; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-0.5 text-[10px] opacity-60 hover:opacity-100 transition-opacity">
      {icon}{count > 0 && <span>{count}</span>}
    </button>
  );
}
