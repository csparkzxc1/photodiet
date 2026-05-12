import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { typography, type TypographyVariant } from '@/theme';

type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
};

const weightToFamily = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

export function Text({
  variant = 'body',
  color = '#2C2C2C',
  weight,
  style,
  ...rest
}: TextProps) {
  const variantStyle = typography[variant];
  const fontFamily = weight ? weightToFamily[weight] : variantStyle.fontFamily;

  return (
    <RNText
      allowFontScaling
      style={[variantStyle, { color, fontFamily }, style]}
      {...rest}
    />
  );
}
