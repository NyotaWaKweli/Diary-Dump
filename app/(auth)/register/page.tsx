'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name, email, password }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      
      await refreshUser();
      router.push('/');
    } catch (err: any) { setError(err.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4"><span className="text-3xl font-bold text-white">D</span></div>
          <h1 className="text-2xl font-bold text-foreground font-serif">Create Account</h1>
          <p className="text-muted-foreground mt-1">Start your diary journey today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">{error}</motion.div>}
          <div><label className="text-sm font-medium text-foreground mb-2 block">Display Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="How should we call you?" className="input-field pl-10" required maxLength={50} /></div></div>
          <div><label className="text-sm font-medium text-foreground mb-2 block">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-10" required /></div></div>
          <div><label className="text-sm font-medium text-foreground mb-2 block">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" className="input-field pl-10" required minLength={6} /></div></div>
          <div><label className="text-sm font-medium text-foreground mb-2 block">Confirm Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm your password" className="input-field pl-10" required /></div></div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account...</> : <><>Get Started</><ArrowRight className="h-4 w-4" /></>}</button>
        </form>
        <div className="mt-6 text-center"><p className="text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-accent hover:underline font-medium">Sign In</Link></p></div>
      </motion.div>
    </div>
  );
}
