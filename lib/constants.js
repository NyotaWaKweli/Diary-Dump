// lib/constants.js
export const WALL_SIZE      = 4000;
export const SCALE_MIN      = 0.08;
export const SCALE_MAX      = 3.0;
export const DRAG_THRESHOLD = 5;

export const COLOR_KEYS = ['cream', 'rose', 'sage', 'blue', 'lavender', 'gold'];

export const COLOR_MAP = {
  cream:    { bg: '#F5F1E8', border: '#D0CCB8' },
  rose:     { bg: '#F0E6E0', border: '#D0BEB8' },
  sage:     { bg: '#E6EBE4', border: '#C0C8BC' },
  blue:     { bg: '#E4E8F0', border: '#BCC4D8' },
  lavender: { bg: '#ECE4F0', border: '#C8BCD8' },
  gold:     { bg: '#F5EFE0', border: '#D4C89C' },
};

export const REACTIONS = ['🕯️', '🌹', '💙', '🤍', '🕊️'];

// Firestore-safe keys for each emoji (no special chars in field paths)
export const REACTION_KEYS = {
  '🕯️': 'candle',
  '🌹': 'rose',
  '💙': 'blue_heart',
  '🤍': 'white_heart',
  '🕊️': 'dove',
};
// Reverse map: key → emoji
export const REACTION_EMOJIS = Object.fromEntries(
  Object.entries(REACTION_KEYS).map(([e, k]) => [k, e])
);

export const SESSION_KEY    = 'dd_session';
export const VIEWED_KEY     = 'dd_viewed';
export const REACT_KEY_PFX  = 'dd_react_';

