import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        foreground: '#fafafa',
        muted: '#27272a',
        'muted-foreground': '#a1a1aa',
        border: '#27272a',
        primary: '#a78bfa',
        'primary-foreground': '#0a0a0a',
        accent: '#1f1f23',
      },
    },
  },
  plugins: [],
};

export default config;
