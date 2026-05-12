export const lightColors = {
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  primary: '#E8957B',
  primaryDark: '#D17F66',
  accent: '#7BA98E',
  warning: '#D9534F',
  text: '#2C2C2C',
  textSub: '#7A7A7A',
  textTertiary: '#A8A8A8',
  border: '#E5E1DA',
  overlay: 'rgba(44,44,44,0.5)',
} as const;

export const darkColors = {
  bg: '#1A1A1A',
  surface: '#262626',
  primary: '#E8957B',
  primaryDark: '#D17F66',
  accent: '#7BA98E',
  warning: '#D9534F',
  text: '#F5F5F5',
  textSub: '#B0B0B0',
  textTertiary: '#787878',
  border: '#3A3A3A',
  overlay: 'rgba(0,0,0,0.6)',
} as const;

export type ColorToken = keyof typeof lightColors;
export type ColorPalette = typeof lightColors;
