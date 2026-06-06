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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        hand: ['"Caveat"', '"Comic Sans MS"', '"Chalkboard SE"', 'cursive', 'sans-serif'],
        body: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'fly-in': 'flyIn 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'heart-burst': 'heartBurst 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'note-drop': 'noteDrop 0.52s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
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
        heartBurst: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.35)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        noteDrop: {
          '0%': { opacity: '0', transform: 'translate(-50%,-50%) rotate(var(--r,0deg)) scale(0.35)' },
          '65%': { transform: 'translate(-50%,-50%) rotate(var(--r,0deg)) scale(1.04)' },
          '100%': { opacity: '1', transform: 'translate(-50%,-50%) rotate(var(--r,0deg)) scale(1)' },
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
