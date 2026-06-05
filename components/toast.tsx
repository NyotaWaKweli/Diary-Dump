'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose, duration = 4000 }: {
  message: string; type?: 'success' | 'error'; onClose: () => void; duration?: number;
}) {
  useEffect(() => { const t = setTimeout(onClose, duration); return () => clearTimeout(t); }, [duration, onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-20 left-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${type === 'success' ? 'bg-green-500 text-white' : 'bg-destructive text-destructive-foreground'}`}>
      {type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity"><X className="h-4 w-4" /></button>
    </motion.div>
  );
}
