import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cork: { light: '#F5F5F0', DEFAULT: '#E8E4D9', dark: '#C4BFAF' },
        navy: { 900: '#0F0F23', 800: '#1A1A2E', 700: '#16213E', 600: '#0F3460' },
        note: {
          yellow: '#FFF9C4', blue: '#BBDEFB', pink: '#F8BBD0',
          green: '#C8E6C9', orange: '#FFE0B2', purple: '#E1BEE7',
        },
        accent: { DEFAULT: '#E94560', hover: '#D63A54' },
      },
      fontFamily: {
        hand: ['"Comic Sans MS"', '"Chalkboard SE"', 'cursive', 'sans-serif'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fly-in': 'flyIn 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        flyIn: {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'note': '2px 3px 8px rgba(0,0,0,0.15)',
        'note-hover': '4px 6px 16px rgba(0,0,0,0.2)',
        'note-dark': '2px 3px 8px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
