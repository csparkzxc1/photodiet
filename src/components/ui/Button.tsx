import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { lightColors } from '@/theme/colors';
import { radius, spacing, touchTarget } from '@/theme/tokens';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

const sizeMap: Record<Size, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 },
  md: { paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 },
};

function getColors(variant: Variant, pressed: boolean) {
  switch (variant) {
    case 'primary':
      return {
        bg: pressed ? lightColors.primaryDark : lightColors.primary,
        fg: '#FFFFFF',
        border: 'transparent',
      };
    case 'secondary':
      return {
        bg: pressed ? lightColors.border : lightColors.surface,
        fg: lightColors.text,
        border: lightColors.border,
      };
    case 'ghost':
      return {
        bg: pressed ? lightColors.border : 'transparent',
        fg: lightColors.text,
        border: 'transparent',
      };
    case 'danger':
      return {
        bg: pressed ? '#B73C38' : lightColors.warning,
        fg: '#FFFFFF',
        border: 'transparent',
      };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  fullWidth = false,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const sizing = sizeMap[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={8}
      style={({ pressed }) => {
        const palette = getColors(variant, pressed && !isDisabled);
        return [
          {
            minHeight: touchTarget.min,
            borderRadius: radius.md,
            paddingVertical: sizing.paddingVertical,
            paddingHorizontal: sizing.paddingHorizontal,
            backgroundColor: palette.bg,
            borderWidth: variant === 'secondary' ? 1 : 0,
            borderColor: palette.border,
            opacity: isDisabled ? 0.5 : 1,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: spacing.sm,
            alignSelf: fullWidth ? 'stretch' : 'auto',
          },
          style,
        ];
      }}
      {...rest}
    >
      {({ pressed }) => {
        const palette = getColors(variant, pressed && !isDisabled);
        return loading ? (
          <ActivityIndicator color={palette.fg} />
        ) : (
          <Text
            variant="body"
            weight="semibold"
            color={palette.fg}
            style={{ fontSize: sizing.fontSize }}
          >
            {label}
          </Text>
        );
      }}
    </Pressable>
  );
}
