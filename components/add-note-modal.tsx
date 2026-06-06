'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Image, RotateCcw, Lock } from 'lucide-react';
import { hslToHex, hexToHsl } from '@/lib/utils';

interface AddNoteModalProps {
  spaceId: string;
  onClose: () => void;
  onSuccess: (note: any) => void;
}

export function AddNoteModal({ spaceId, onClose, onSuccess }: AddNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#F5F1E8');
  const [rotation, setRotation] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [allowSaves, setAllowSaves] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleColorWheelClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const hue = (angle + 360) % 360;
    const distance = Math.min(Math.sqrt(x * x + y * y) / (rect.width / 2), 1);
    const saturation = Math.round(distance * 100);
    const lightness = 85;
    setColor(hslToHex(hue, saturation, lightness));
  }, []);

  const drawColorWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 2;

    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = angle * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
      ctx.fill();
    }

    // Inner white overlay for pastel effect
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Images only');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) setImage(data.url);
  };

  const handleSubmit = async () => {
    if (!content.trim()) { setError('Write something first'); return; }
    setLoading(true); setError('');

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: spaceId,
          title,
          content: content.trim(),
          color,
          color_hex: color,
          position_x: Math.random() * 70 + 15,
          position_y: Math.random() * 60 + 20,
          rotation,
          image_url: image,
          allow_saves: allowSaves,
        }),
      });

      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      const note = await res.json();
      onSuccess(note);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#F5F1E8] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <h2 className="text-lg font-bold text-black/80 font-serif">New Note</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X className="h-5 w-5 text-black/60" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-red-100 text-red-600 text-sm">
              {error}
            </motion.div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-black/60 mb-2 block">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give it a name..."
              className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-black/80 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-black/60 mb-2 block">Your thoughts <span className="text-red-400">*</span></label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Pour your heart out..."
              className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white text-black/80 placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent min-h-[120px] resize-y font-hand text-lg"
              maxLength={2000}
            />
            <div className="text-xs text-black/30 mt-1 text-right">{content.length}/2000</div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-sm font-medium text-black/60 mb-2 block">Note Color</label>
            <div className="flex items-center gap-4">
              <canvas
                ref={canvasRef}
                width={120}
                height={120}
                onClick={handleColorWheelClick}
                onMouseEnter={drawColorWheel}
                className="rounded-full cursor-crosshair border-2 border-black/10"
                style={{ background: '#f0f0f0' }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="w-full h-12 rounded-lg border-2 border-black/10 shadow-inner"
                  style={{ backgroundColor: color }}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black/40 font-mono">#</span>
                  <input
                    type="text"
                    value={color.replace('#', '')}
                    onChange={e => {
                      const hex = '#' + e.target.value.replace(/[^0-9A-Fa-f]/g, '').substring(0, 6);
                      setColor(hex);
                    }}
                    className="flex-1 px-2 py-1 text-sm font-mono rounded border border-black/10 bg-white text-black/80"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="text-sm font-medium text-black/60 mb-2 block flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> Tilt: {rotation}°
            </label>
            <input
              type="range"
              min="-15"
              max="15"
              value={rotation}
              onChange={e => setRotation(Number(e.target.value))}
              className="w-full accent-[#C9A96E]"
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium text-black/60 mb-2 block">Attach Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-black/20 text-black/50 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors w-full justify-center"
            >
              <Image className="h-5 w-5" />
              {image ? 'Change Photo' : 'Take or Choose Photo'}
            </button>
            {image && (
              <div className="mt-2 relative rounded-lg overflow-hidden">
                <img src={image} alt="" className="w-full h-32 object-cover" />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Allow Saves */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-black/5">
            <Lock className="h-4 w-4 text-black/40" />
            <div className="flex-1">
              <div className="text-sm font-medium text-black/70">Allow others to save</div>
              <div className="text-xs text-black/40">People can add this to their saved notes</div>
            </div>
            <button
              onClick={() => setAllowSaves(!allowSaves)}
              className={`w-12 h-6 rounded-full transition-colors relative ${allowSaves ? 'bg-[#C9A96E]' : 'bg-black/20'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${allowSaves ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 bg-black/5">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-black/20 text-black/60 hover:bg-black/5 transition-colors text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="px-5 py-2.5 rounded-lg bg-[#2C2C2C] text-[#F5F1E8] hover:opacity-90 transition-opacity text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Pinning...' : 'Pin to Wall'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
