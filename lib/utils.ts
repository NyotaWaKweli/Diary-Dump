import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function generateRandomPosition() {
  const x = Math.floor(Math.random() * 80) + 5;
  const y = Math.floor(Math.random() * 70) + 10;
  const rotation = Math.floor(Math.random() * 20) - 10;
  return { x, y, rotation };
}

export const NOTE_COLORS: { value: string; label: string; bg: string; text: string }[] = [
  { value: 'yellow', label: 'Yellow', bg: 'bg-note-yellow', text: 'text-yellow-900' },
  { value: 'blue', label: 'Blue', bg: 'bg-note-blue', text: 'text-blue-900' },
  { value: 'pink', label: 'Pink', bg: 'bg-note-pink', text: 'text-pink-900' },
  { value: 'green', label: 'Green', bg: 'bg-note-green', text: 'text-green-900' },
  { value: 'orange', label: 'Orange', bg: 'bg-note-orange', text: 'text-orange-900' },
  { value: 'purple', label: 'Purple', bg: 'bg-note-purple', text: 'text-purple-900' },
];

export function getNoteColorClasses(color: string) {
  const map: Record<string, { bg: string; text: string }> = {
    yellow: { bg: 'bg-note-yellow', text: 'text-yellow-900' },
    blue: { bg: 'bg-note-blue', text: 'text-blue-900' },
    pink: { bg: 'bg-note-pink', text: 'text-pink-900' },
    green: { bg: 'bg-note-green', text: 'text-green-900' },
    orange: { bg: 'bg-note-orange', text: 'text-orange-900' },
    purple: { bg: 'bg-note-purple', text: 'text-purple-900' },
  };
  return map[color] || map.yellow;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
