import { Warning } from 'phosphor-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { lightColors } from '@/theme/colors';
import { radius } from '@/theme/tokens';

export function CapacityFullIllustration() {
  return (
    <View style={{ alignItems: 'center', gap: 24 }}>
      <View
        style={{
          width: 200,
          height: 130,
          backgroundColor: lightColors.surface,
          borderRadius: radius.lg,
          padding: 18,
          gap: 10,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <View
          style={{
            height: 8,
            width: 130,
            borderRadius: 4,
            backgroundColor: lightColors.warning,
          }}
        />
        <View
          style={{
            height: 8,
            width: 110,
            borderRadius: 4,
            backgroundColor: lightColors.border,
          }}
        />
        <View
          style={{
            height: 8,
            width: 90,
            borderRadius: 4,
            backgroundColor: lightColors.border,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: lightColors.warning,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Warning size={16} color="#FFFFFF" weight="bold" />
        </View>
      </View>

      <View
        style={{
          backgroundColor: lightColors.primaryTint,
          paddingVertical: 10,
          paddingHorizontal: 18,
          borderRadius: 999,
        }}
      >
        <Text variant="body" weight="bold" color={lightColors.primary}>
          iCloud 저장공간 97% 사용 중
        </Text>
      </View>
    </View>
  );
}
