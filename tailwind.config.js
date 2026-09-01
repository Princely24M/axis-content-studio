/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec1ff',
          400: '#599dff',
          500: '#3478f6',
          600: '#1f59e8',
          700: '#1a45d0',
          800: '#1c3aa8',
          900: '#1d3585',
          950: '#162152',
        },
        accent: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c8',
          400: '#8590a8',
          500: '#67738d',
          600: '#525c74',
          700: '#434b5e',
          800: '#3a4051',
          900: '#343846',
          950: '#22252e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(15, 23, 42, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)',
        glow: '0 0 24px rgba(52, 120, 246, 0.25)',
        'glow-accent': '0 0 24px rgba(20, 184, 166, 0.25)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(at 20% 20%, rgba(52,120,246,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(20,184,166,0.10) 0px, transparent 50%), radial-gradient(at 0% 80%, rgba(52,120,246,0.08) 0px, transparent 50%)',
        'mesh-dark':
          'radial-gradient(at 20% 20%, rgba(52,120,246,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(20,184,166,0.12) 0px, transparent 50%), radial-gradient(at 0% 80%, rgba(52,120,246,0.10) 0px, transparent 50%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
