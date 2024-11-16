/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00FFA3',
          dark: '#00CC82',
          light: '#7AFFCD',
        },
        dark: {
          DEFAULT: '#0A0B0F',
          light: '#151821',
          lighter: '#1E2230',
        },
        accent: {
          blue: '#0BCCF9',
          purple: '#8B5CF6',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 255, 163, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 255, 163, 0.6)' }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};