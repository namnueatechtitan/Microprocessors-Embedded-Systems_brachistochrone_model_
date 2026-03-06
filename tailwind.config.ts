import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        panel: '#0f172a',
        glass: '#111827',
        lane1: '#2563eb',
        lane2: '#475569',
        lane3: '#0891b2',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseglow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.35)' },
          '50%': { boxShadow: '0 0 0 8px rgba(34, 197, 94, 0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 450ms ease-out',
        pulseglow: 'pulseglow 2s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
