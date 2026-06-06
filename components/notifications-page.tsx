'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, UserPlus, FileText, Bookmark, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'like' | 'share' | 'repost' | 'join_space' | 'new_note' | 'save';
  message: string;
  is_read: boolean;
  created_at: string;
  actor?: { display_name: string; avatar_url?: string };
  space?: { name: string; slug: string };
  note?: { id: string; title: string };
}

const typeIcons = {
  like: Heart,
  share: Share2,
  repost: Share2,
  join_space: UserPlus,
  new_note: FileText,
  save: Bookmark,
};

export function NotificationsPage({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      });
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-accent mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-30">🔔</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">Activity on your notes and spaces will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => {
              const Icon = typeIcons[notification.type] || Heart;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => !notification.is_read && markRead(notification.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                    notification.is_read 
                      ? 'border-border bg-card opacity-60' 
                      : 'border-accent/20 bg-accent/5'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.is_read ? 'bg-muted' : 'bg-accent/10'
                  }`}>
                    <Icon className={`h-5 w-5 ${notification.is_read ? 'text-muted-foreground' : 'text-accent'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notification.created_at)}</p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
