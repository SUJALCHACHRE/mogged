import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#080705',
        surface: '#17130E',
        elevated: '#211B13',
        brand: {
          purple: '#C9A46A',
          'purple-light': '#EAD6A6',
          teal: '#2F7D68',
          coral: '#A54F47',
          amber: '#B87B55',
          gold: '#C9A46A',
          emerald: '#2F7D68',
          ink: '#1E2540',
          rose: '#A54F47',
        },
      },
      fontFamily: {
        sans: ['Aptos', 'Segoe UI', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Cascadia Code', 'SFMono-Regular', 'Consolas', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        'glow-teal': 'glowTeal 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(201,164,106,0.22)' },
          '100%': { boxShadow: '0 0 44px rgba(201,164,106,0.44)' },
        },
        glowTeal: {
          '0%': { boxShadow: '0 0 20px rgba(47,125,104,0.25)' },
          '100%': { boxShadow: '0 0 40px rgba(47,125,104,0.5)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
