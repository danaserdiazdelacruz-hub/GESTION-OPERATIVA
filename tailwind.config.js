/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#007BFF',
          light: '#6366f1',
          dark: '#0056b3',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
          dark: '#b91c1c',
        },
        success: {
          DEFAULT: '#16a34a',
          light: '#f0fdf4',
          dark: '#15803d',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
          dark: '#d97706',
        },
        surface: {
          DEFAULT: '#e5e7eb',
          secondary: '#ffffff',
          tertiary: '#d1d5db',
        },
        text: {
          DEFAULT: '#0f172a',
          secondary: '#334155',
          light: '#64748b',
        },
      },
      boxShadow: {
        glow: '0 6px 20px rgba(0, 123, 255, 0.35)',
      },
    },
  },
  plugins: [],
};
