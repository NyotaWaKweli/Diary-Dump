'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers';
import { Bell, Moon, Sun, HelpCircle, MessageSquare, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Toast } from '@/components/toast';
import Link from 'next/link';

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) { html.classList.remove('dark'); setIsDark(false); }
    else { html.classList.add('dark'); setIsDark(true); }
  };

  const toggleNotifications = async () => {
    const v = !notifications;
    setNotifications(v);
    try {
      const res = await fetch('/api/users/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: v }),
      });
      if (!res.ok) throw new Error('Failed');
      setToast({ message: 'Settings saved', type: 'success' });
    } catch { setNotifications(!v); setToast({ message: 'Failed to save', type: 'error' }); }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to access settings</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your preferences and account</p>
        </motion.div>
        <div className="space-y-6">
          <Section title="Preferences">
            <ToggleItem icon={<Bell className="h-5 w-5 text-accent" />} bg="bg-accent/10" title="Enable Notifications" desc="Get notified about new notes" value={notifications} onChange={toggleNotifications} />
            <ToggleItem icon={isDark ? <Sun className="h-5 w-5 text-indigo-500" /> : <Moon className="h-5 w-5 text-indigo-500" />} bg="bg-indigo-500/10" title="Night Mode" desc="Switch between light and dark" value={isDark} onChange={toggleTheme} />
          </Section>
          <Section title="Support">
            <LinkItem icon={<HelpCircle className="h-5 w-5 text-blue-500" />} bg="bg-blue-500/10" title="FAQ" desc="Frequently asked questions" href="#" />
            <LinkItem icon={<MessageSquare className="h-5 w-5 text-green-500" />} bg="bg-green-500/10" title="Send Feedback" desc="Report issues or suggest features" href="#" />
          </Section>
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-destructive/20 bg-destructive/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-destructive/20"><h2 className="text-sm font-semibold text-destructive uppercase tracking-wider">Danger Zone</h2></div>
            <div className="px-6 py-4">
              {!showDelete ? (
                <button onClick={() => setShowDelete(true)} className="flex items-center gap-3 w-full text-left group">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors"><Trash2 className="h-5 w-5 text-destructive" /></div>
                  <div className="flex-1"><p className="font-medium text-destructive">Delete Space</p><p className="text-sm text-destructive/70">Permanently delete your diary space</p></div>
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div><p className="font-medium text-destructive">Are you sure?</p><p className="text-sm text-destructive/70 mt-1">This cannot be undone. All notes and data will be permanently deleted.</p></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={() => setToast({ message: 'Feature coming soon', type: 'error' })} className="btn-danger flex-1 flex items-center justify-center gap-2"><Trash2 className="h-4 w-4" />Delete Permanently</button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border"><h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2></div>
      <div className="divide-y divide-border">{children}</div>
    </motion.section>
  );
}

function ToggleItem({ icon, bg, title, desc, value, onChange }: any) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
        <div><p className="font-medium text-foreground">{title}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
      </div>
      <button onClick={onChange} className={`relative h-7 w-12 rounded-full transition-colors ${value ? 'bg-accent' : 'bg-muted'}`}><div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
    </div>
  );
}

function LinkItem({ icon, bg, title, desc, href }: any) {
  return (
    <Link href={href} className="flex items-center gap-3 px-6 py-4 hover:bg-muted/50 transition-colors">
      <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
      <div className="flex-1"><p className="font-medium text-foreground">{title}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
    </Link>
  );
}
