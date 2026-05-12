import { View } from 'react-native';

import { Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';

export function BestPhotoBadge() {
  return (
    <View
      style={{
        backgroundColor: lightColors.primary,
        paddingVertical: 4,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.sm,
        alignSelf: 'flex-start',
      }}
    >
      <Text variant="caption" color="#FFFFFF" weight="bold">
        ★ {ko.group.bestLabel}
      </Text>
    </View>
  );
}
