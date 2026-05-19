import {Platform} from 'react-native';

export const theme = {
  colors: {
    bgBase: '#080808',
    bgSurface: '#111111',
    bgElevated: '#1a1a1a',

    textPrimary: '#f2f2f2',
    textSecondary: '#8a8a8a',
    textTertiary: '#444444',

    borderSubtle: 'rgba(255,255,255,0.06)',
    borderDefault: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(255,255,255,0.18)',

    green: '#22c55e',
    greenGlow: 'rgba(34,197,94,0.12)',
    greenBorder: 'rgba(34,197,94,0.30)',
    red: '#ef4444',
    redGlow: 'rgba(239,68,68,0.12)',
    redBorder: 'rgba(239,68,68,0.30)',
    amber: '#f59e0b',

    ranks: {
      Novice: '#6b7280',
      Observateur: '#3b82f6',
      Analyste: '#8b5cf6',
      Expert: '#f59e0b',
      Inhumain: '#f2f2f2',
    },

    categories: {
      portrait: '#d4a0ac',
      landscape: '#9eb89a',
      urban: '#96acd4',
      product: '#d4b070',
      animal: '#b4a4d8',
      architecture: '#8ec4be',
    },
  },

  spacing: {
    s1: 4,
    s2: 8,
    s3: 12,
    s4: 16,
    s5: 20,
    s6: 24,
    s8: 32,
    s10: 40,
  },

  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },

  font: {
    sans: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  duration: {
    fast: 120,
    base: 220,
    slow: 380,
  },
} as const;

export type Theme = typeof theme;
