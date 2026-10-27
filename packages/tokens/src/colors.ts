export const colors = {
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
  accent: {
    teal: '#0d9488',
    amber: '#f59e0b',
    rose: '#f43f5e',
    emerald: '#10b981',
  },
  feedback: {
    correct: '#10b981',     // green - phoneme accurate
    imprecise: '#f59e0b',   // amber - slight mispronunciation
    incorrect: '#ef4444',   // red - mispronounced / missing
    neutral: '#94a3b8',     // slate - unattempted
  },
  audio: {
    waveform: '#6366f1',
    recording: '#ef4444',
    listening: '#06b6d4',
    speaker: '#8b5cf6',
  },
  background: {
    light: '#ffffff',
    dark: '#090d16',
    cardLight: '#f8fafc',
    cardDark: '#131b2e',
  },
} as const;
