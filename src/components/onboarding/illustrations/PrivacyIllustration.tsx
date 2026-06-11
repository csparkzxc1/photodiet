import { Check, Lock } from 'phosphor-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { lightColors } from '@/theme/colors';
import { radius } from '@/theme/tokens';

const BULLETS = [
  '인터넷 연결 없이 분석',
  '사진이 서버로 전송되지 않음',
  '분석 후 데이터 즉시 삭제',
];

export function PrivacyIllustration() {
  return (
    <View style={{ alignItems: 'center', gap: 18 }}>
      <View
        style={{
          width: 110,
          height: 110,
          borderRadius: 24,
          backgroundColor: lightColors.accentTint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Lock size={56} color={lightColors.accent} weight="duotone" />
      </View>

      <View style={{ gap: 8, alignSelf: 'stretch', marginHorizontal: 32 }}>
        {BULLETS.map((b) => (
          <View
            key={b}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: lightColors.surface,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: radius.lg,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: lightColors.accentTint,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Check size={13} color={lightColors.accent} weight="bold" />
            </View>
            <Text variant="body" style={{ fontSize: 14, flex: 1 }}>
              {b}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
