import { Camera } from 'phosphor-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { lightColors } from '@/theme/colors';
import { radius } from '@/theme/tokens';

const ICONS = [
  { emoji: '🖼️', label: '사진첩' },
  { emoji: '📊', label: '분석' },
  { emoji: '🗑️', label: '정리' },
];

export function PermissionIllustration() {
  return (
    <View style={{ gap: 18, alignItems: 'center', width: '100%' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 14,
        }}
      >
        {ICONS.map((i) => (
          <View key={i.label} style={{ alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: lightColors.primaryTint,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 30 }}>{i.emoji}</Text>
            </View>
            <Text
              variant="caption"
              color={lightColors.textSub}
              style={{ fontSize: 12 }}
            >
              {i.label}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: lightColors.surface,
          borderRadius: radius.lg,
          paddingVertical: 20,
          paddingHorizontal: 20,
          gap: 8,
          alignItems: 'center',
          width: '70%',
        }}
      >
        <Camera size={28} color={lightColors.text} weight="duotone" />
        <Text variant="body" weight="bold" style={{ fontSize: 15 }}>
          사진첩 접근 권한
        </Text>
        <Text
          variant="caption"
          color={lightColors.textSub}
          style={{ fontSize: 12, textAlign: 'center', lineHeight: 18 }}
        >
          비슷한 사진 그룹을 찾기 위해{'\n'}사진첩에 접근합니다
        </Text>
      </View>
    </View>
  );
}
