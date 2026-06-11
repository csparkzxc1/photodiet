import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

type VariantStyle = Required<
  Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight'>
>;

export const typography: Record<
  'display' | 'title' | 'body' | 'caption' | 'stat',
  VariantStyle
> = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    lineHeight: 26,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  stat: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 38,
  },
};

export type TypographyVariant = keyof typeof typography;
