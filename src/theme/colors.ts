export const lightColors = {
  bg: '#F2ECE2',
  surface: '#FFFFFF',
  surfaceMuted: '#F8F4EC',
  primary: '#E8957B',
  primaryDark: '#D17F66',
  primaryTint: '#FCE5DA',
  accent: '#7FB99A',
  accentTint: '#E8F0E5',
  warning: '#D9534F',
  warningTint: '#FBE3E2',
  text: '#2C2C2C',
  textSub: '#7A7A7A',
  textTertiary: '#A8A8A8',
  border: '#E5E1DA',
  borderSoft: '#EFE9DF',
  overlay: 'rgba(44,44,44,0.5)',
} as const;

export const darkColors = {
  bg: '#1A1A1A',
  surface: '#262626',
  surfaceMuted: '#1F1F1F',
  primary: '#E8957B',
  primaryDark: '#D17F66',
  primaryTint: '#3A2520',
  accent: '#7FB99A',
  accentTint: '#1F2D26',
  warning: '#D9534F',
  warningTint: '#3A1F1E',
  text: '#F5F5F5',
  textSub: '#B0B0B0',
  textTertiary: '#787878',
  border: '#3A3A3A',
  borderSoft: '#2A2A2A',
  overlay: 'rgba(0,0,0,0.6)',
} as const;

export type ColorToken = keyof typeof lightColors;
export type ColorPalette = typeof lightColors;
