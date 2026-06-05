'use client';

import Link from 'next/link';
import { useAuth } from './providers';
import { Home, Settings, LogOut, User, Menu, X, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, refreshUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await refreshUser();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent text-white font-bold text-lg flex items-center justify-center">D</div>
          <div>
            <span className="text-lg font-bold text-foreground">DIARY DUMP</span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">write it down...</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />Menu
          </Link>
          {user && (
            <Link href="/settings" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Settings className="h-4 w-4" />Settings
            </Link>
          )}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors ml-2">
            {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>
          {user ? (
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm font-medium text-foreground hidden lg:block">{user.display_name}</span>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors">Get Started</Link>
            </div>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-2">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"><Home className="h-4 w-4" />Menu</Link>
          {user && <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"><Settings className="h-4 w-4" />Settings</Link>}
          <button onClick={() => { toggleTheme(); setMobileOpen(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{isDark ? 'Light Mode' : 'Dark Mode'}</button>
          {user ? (
            <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"><LogOut className="h-4 w-4" />Sign Out</button>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">Sign In</Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
