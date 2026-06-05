'use client';

import Link from 'next/link';
import { Pin, Lock, FileText, Users } from 'lucide-react';
import type { Space } from '@/types';

export function SpaceCard({ space, index = 0 }: { space: Space; index?: number }) {
  return (
    <Link href={`/spaces/${space.slug}`} className="group block p-5 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {space.is_pinned && <Pin className="h-4 w-4 text-accent fill-accent" />}
            {!space.is_public && <Lock className="h-4 w-4 text-muted-foreground" />}
            <h3 className="font-bold text-foreground truncate group-hover:text-accent transition-colors">{space.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{space.owner?.display_name ? `Created by ${space.owner.display_name}` : 'A personal diary space'}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{space.note_count || 0} notes</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{space.is_public ? 'Public' : 'Private'}</span>
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 ml-3 group-hover:bg-accent/20 transition-colors">
          <span className="text-lg font-bold text-accent">{space.name[0].toUpperCase()}</span>
        </div>
      </div>
    </Link>
  );
}
