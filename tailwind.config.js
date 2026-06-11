/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#FAF7F2',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#E8957B',
          dark: '#D17F66',
        },
        accent: '#7BA98E',
        warning: '#D9534F',
        text: {
          DEFAULT: '#2C2C2C',
          sub: '#7A7A7A',
          tertiary: '#A8A8A8',
        },
        border: '#E5E1DA',
        overlay: 'rgba(44,44,44,0.5)',
      },
      fontFamily: {
        sans: ['Pretendard-Regular'],
        medium: ['Pretendard-Medium'],
        semibold: ['Pretendard-SemiBold'],
        bold: ['Pretendard-Bold'],
      },
      fontSize: {
        display: ['28px', { lineHeight: '34px', fontWeight: '700' }],
        title: ['20px', { lineHeight: '26px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        caption: ['13px', { lineHeight: '18px', fontWeight: '500' }],
        stat: ['32px', { lineHeight: '38px', fontWeight: '700' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      spacing: {
        4: '4px',
        8: '8px',
        16: '16px',
        24: '24px',
        32: '32px',
        48: '48px',
      },
    },
  },
  plugins: [],
};
