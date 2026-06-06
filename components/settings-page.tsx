'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, HelpCircle, MessageSquare, Trash2, Info, Shield, 
  ChevronRight, Send, X, Camera, User, Mail 
} from 'lucide-react';
import Link from 'next/link';

interface SettingsPageProps {
  currentUser: { userId: string; email: string } | null;
}

const FAQS = [
  {
    q: 'What is Diary Dump?',
    a: 'Diary Dump is a scattered wall of personal diaries and confessions. Create spaces, join communities, and pin your thoughts for others to discover.',
  },
  {
    q: 'How do I create a space?',
    a: 'Click "Create Your Space" on the homepage, give it a name, and choose whether it\'s public or private. You\'re ready to start pinning notes.',
  },
  {
    q: 'Who can see my notes?',
    a: 'Public spaces are visible to everyone. Private spaces require a password. You control who can write by requiring users to join first.',
  },
  {
    q: 'Can I edit or delete my notes?',
    a: 'Yes. Tap any note you created to open it, then use the edit or delete options.',
  },
  {
    q: 'What does "Allow saves" mean?',
    a: 'When enabled, other users can save your note to their personal collection. You can toggle this off for any note.',
  },
  {
    q: 'How do likes work?',
    a: 'Double-tap any note to like it, just like Instagram. Or tap the heart icon. Only the creator gets notified.',
  },
  {
    q: 'What are reposts?',
    a: 'Reposting shares someone else\'s note to a space you belong to, while always crediting the original author.',
  },
  {
    q: 'Is my data safe?',
    a: 'We never sell your data. Your email is encrypted, and passwords are hashed. Read our full Privacy Policy below.',
  },
  {
    q: 'How do I get notifications?',
    a: 'Follow spaces to get notified about new notes. You\'ll also get notified when someone likes, comments, or reposts your notes.',
  },
  {
    q: 'Can I use Diary Dump without an account?',
    a: 'You can browse public spaces, but to write notes, comment, like, or save, you need to sign up.',
  },
];

const PRIVACY_POLICY = `
Privacy Policy for Diary Dump

Last updated: June 2026

1. INFORMATION WE COLLECT
We collect your email address, display name, and any content you create (notes, comments, spaces). We also collect usage data (views, likes) to improve the platform.

2. HOW WE USE YOUR INFORMATION
- To provide and maintain the service
- To notify you about activity on your content
- To improve user experience
- We do NOT sell your data to third parties

3. CONTENT YOU CREATE
- You own your notes and content
- Public content is visible to all users
- Private spaces are only accessible to those with the password
- Saved notes are only visible to the saver

4. DATA STORAGE
Your data is stored securely on Supabase servers. Images are stored in encrypted storage buckets.

5. COOKIES
We use HTTP-only cookies for authentication. No tracking cookies.

6. YOUR RIGHTS
You can delete your account and all associated data at any time through Settings.

7. CONTACT
For privacy concerns, contact us through the Feedback form in Settings.

Developers: Michael Kilong & Nyota Wa Kweli
`;

export function SettingsPage({ currentUser }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackImage, setFeedbackImage] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [notifications, setNotifications] = useState(true);

  const handleFeedbackSubmit = async () => {
    if (!feedbackContent.trim()) return;
    
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: feedbackName,
        email: feedbackEmail,
        content: feedbackContent,
        image_url: feedbackImage,
        is_anonymous: !feedbackName,
      }),
    });
    
    if (res.ok) {
      setFeedbackSent(true);
      setFeedbackName(''); setFeedbackEmail(''); setFeedbackContent(''); setFeedbackImage(null);
      setTimeout(() => setFeedbackSent(false), 3000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) setFeedbackImage(data.url);
  };

  const sections = [
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Manage alerts from spaces you follow' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Common questions answered' },
    { id: 'feedback', label: 'Send Feedback', icon: MessageSquare, description: 'Help us improve' },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield, description: 'How we handle your data' },
    { id: 'about', label: 'About', icon: Info, description: 'Version & credits' },
  ];

  if (currentUser) {
    sections.push({ id: 'delete', label: 'Delete Account', icon: Trash2, description: 'Permanently remove your data' });
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 font-serif">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your Diary Dump experience</p>

        {!activeSection ? (
          <div className="space-y-3">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{section.label}</div>
                  <div className="text-sm text-muted-foreground">{section.description}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <button
              onClick={() => setActiveSection(null)}
              className="mb-6 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Back to Settings
            </button>

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold font-serif">Notifications</h2>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                  <div>
                    <div className="font-medium">Space Notifications</div>
                    <div className="text-sm text-muted-foreground">Get alerts from spaces you follow</div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-accent' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* FAQ */}
            {activeSection === 'faq' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold font-serif">Frequently Asked Questions</h2>
                {FAQS.map((faq, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="font-medium text-foreground mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Feedback */}
            {activeSection === 'feedback' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold font-serif">Send Feedback</h2>
                {feedbackSent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-xl bg-green-50 text-green-700 text-center">
                    <div className="text-3xl mb-2">✓</div>
                    <div className="font-medium">Thank you for your feedback!</div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Name (optional)</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={feedbackName}
                            onChange={e => setFeedbackName(e.target.value)}
                            placeholder="Your name"
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Email (optional)</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={feedbackEmail}
                            onChange={e => setFeedbackEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Your feedback *</label>
                      <textarea
                        value={feedbackContent}
                        onChange={e => setFeedbackContent(e.target.value)}
                        placeholder="Tell us what's on your mind..."
                        className="input-field min-h-[120px] resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Attach Photo (optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="feedback-image"
                      />
                      <label
                        htmlFor="feedback-image"
                        className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-accent cursor-pointer transition-colors w-fit"
                      >
                        <Camera className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{feedbackImage ? 'Change Photo' : 'Take or Choose Photo'}</span>
                      </label>
                      {feedbackImage && (
                        <div className="mt-2 relative w-fit">
                          <img src={feedbackImage} alt="" className="h-24 rounded-lg object-cover" />
                          <button onClick={() => setFeedbackImage(null)} className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={!feedbackContent.trim()}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Feedback
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Privacy Policy */}
            {activeSection === 'privacy' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold font-serif">Privacy Policy</h2>
                <div className="p-6 rounded-xl border border-border bg-card whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {PRIVACY_POLICY}
                </div>
              </div>
            )}

            {/* About */}
            {activeSection === 'about' && (
              <div className="space-y-6 text-center">
                <h2 className="text-xl font-semibold font-serif">About Diary Dump</h2>
                <div className="p-8 rounded-xl border border-border bg-card">
                  <div className="text-5xl mb-4">📝</div>
                  <div className="text-2xl font-bold font-serif mb-2">Diary Dump</div>
                  <div className="text-sm text-muted-foreground mb-6">Version 1.0.0</div>
                  <div className="border-t border-border pt-6">
                    <div className="text-sm text-muted-foreground mb-4">Crafted with care by</div>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">Michael Kilong</div>
                      <div className="font-medium text-foreground">Nyota Wa Kweli</div>
                    </div>
                  </div>
                  <div className="mt-6 text-xs text-muted-foreground">
                    "Write it down, let it go."
                  </div>
                </div>
              </div>
            )}

            {/* Delete Account */}
            {activeSection === 'delete' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold font-serif text-destructive">Delete Account</h2>
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive mb-4">
                    This will permanently delete your account, all your notes, spaces, and data. This action cannot be undone.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="input-field"
                    />
                    <button
                      disabled={deleteConfirm !== 'DELETE'}
                      className="btn-danger w-full"
                      onClick={() => {/* Delete logic */}}
                    >
                      Permanently Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
