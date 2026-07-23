import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0A1628', 50: '#E8EBF0', 900: '#0A1628' },
        navy2: '#0D1F3C',
        electric: { DEFAULT: '#1E88E5', dark: '#1565C0' },
        cyan2: '#29B6F6',
        flowgreen: { DEFAULT: '#22C55E', dark: '#16A34A' },
        soft: '#F0F7FF',
        light: '#E2EEF9',
      },
      fontFamily: {
        syne: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-body)', 'sans-serif'],
        urdu: ['var(--font-urdu)', 'serif'],
      },
      animation: {
        'pulse-dot': 'pulse 2s infinite',
        'float': 'float 8s ease-in-out infinite',
        'popup-in': 'popupIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fade-up': 'fadeUp 0.7s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-30px) scale(1.05)' },
        },
        popupIn: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeUp: {
          from: { transform: 'translateY(40px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
