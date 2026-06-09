import { Check } from 'phosphor-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { lightColors } from '@/theme/colors';
import { radius } from '@/theme/tokens';

const BULLETS = [
  { title: '구독 없음', body: '매달 나가는 돈 없음' },
  { title: '광고 없음', body: '방해 받지 않는 경험' },
  { title: '업로드 없음', body: '내 사진은 내 폰에' },
];

export function PriceIllustration() {
  return (
    <View style={{ gap: 18, width: '100%', alignItems: 'center' }}>
      <View
        style={{
          backgroundColor: lightColors.primary,
          borderRadius: 24,
          paddingVertical: 28,
          paddingHorizontal: 24,
          alignItems: 'center',
          gap: 6,
          width: '85%',
        }}
      >
        <Text
          variant="body"
          color="rgba(255,255,255,0.85)"
          style={{ fontSize: 14 }}
        >
          평생 이용권
        </Text>
        <Text
          weight="bold"
          color="#FFFFFF"
          style={{ fontSize: 38, lineHeight: 44 }}
        >
          19,900원
        </Text>
        <Text
          variant="body"
          color="rgba(255,255,255,0.85)"
          style={{ fontSize: 13 }}
        >
          단 한 번만 결제
        </Text>
      </View>

      <View
        style={{
          backgroundColor: lightColors.surface,
          borderRadius: radius.lg,
          paddingVertical: spacing12,
          paddingHorizontal: 16,
          gap: 10,
          width: '85%',
        }}
      >
        {BULLETS.map((b, i) => (
          <View
            key={b.title}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 6,
              borderTopWidth: i === 0 ? 0 : 0.5,
              borderTopColor: lightColors.borderSoft,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: lightColors.accentTint,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={13} color={lightColors.accent} weight="bold" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="bold" style={{ fontSize: 14 }}>
                {b.title}
              </Text>
              <Text
                variant="caption"
                color={lightColors.textSub}
                style={{ fontSize: 12 }}
              >
                {b.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const spacing12 = 12;
