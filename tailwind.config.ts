import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [],
  theme: {
    extend: {
      colors: {
        accent: {
          red: '#ff2d20',
          'red-dim': '#ff2d2026',
        },
        surface: {
          border: '#2a2a2a',
          card: '#1a1a1a',
          DEFAULT: '#0d0d0d',
          elevated: '#141414',
        },
        text: {
          muted: '#606060',
          primary: '#f0f0f0',
          secondary: '#a0a0a0',
        },
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
    },
  },
};

export default config;
