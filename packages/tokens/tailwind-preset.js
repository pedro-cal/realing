/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        feedback: {
          correct: '#10b981',
          imprecise: '#f59e0b',
          incorrect: '#ef4444',
          neutral: '#94a3b8',
        },
        audio: {
          waveform: '#6366f1',
          recording: '#ef4444',
          listening: '#06b6d4',
          speaker: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        phonetic: ['Lucida Sans Unicode', 'Arial Unicode MS', 'sans-serif'],
      },
    },
  },
};
