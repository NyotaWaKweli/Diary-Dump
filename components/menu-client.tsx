'use client';

import { useState } from 'react';
import { useAuth } from './providers';
import { CreateSpaceModal } from './create-space-modal';
import { Plus, UserPlus } from 'lucide-react';
import Link from 'next/link';

export function MenuClient() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {user ? (
        <button onClick={() => setIsOpen(true)} className="group flex items-center gap-4 w-full p-6 rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/50 transition-all duration-300 mb-10">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">Create Your Space</h3>
            <p className="text-sm text-muted-foreground">Start your own diary wall and invite others</p>
          </div>
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4 p-6 rounded-xl border-2 border-dashed border-border bg-muted/30 mb-10">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">Start Your Diary Journey</h3>
            <p className="text-sm text-muted-foreground">Sign in to create your own space and start pinning notes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"><UserPlus className="h-4 w-4" />Get Started</Link>
          </div>
        </div>
      )}
      {isOpen && <CreateSpaceModal onClose={() => setIsOpen(false)} onSuccess={(space: any) => { window.location.href = `/spaces/${space.slug}`; }} />}
    </>
  );
}
