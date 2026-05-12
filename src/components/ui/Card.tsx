import { View, type ViewProps, type ViewStyle } from 'react-native';

import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';

type CardProps = ViewProps & {
  padded?: boolean;
  style?: ViewStyle;
};

export function Card({ padded = true, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: lightColors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: lightColors.border,
          padding: padded ? spacing.md : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
