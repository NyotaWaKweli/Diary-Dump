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
