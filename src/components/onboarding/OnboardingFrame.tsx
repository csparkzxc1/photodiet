import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

const TOTAL_STEPS = 6;

type Props = {
  step: number; // 1-based
  title: string;
  body: string;
  ctaLabel: string;
  onNext: () => void;
  illustration: React.ReactNode;
  showBack?: boolean;
};

export function OnboardingFrame({
  step,
  title,
  body,
  ctaLabel,
  onNext,
  illustration,
  showBack = true,
}: Props) {
  return (
    <Screen padded={false} edges={['top', 'bottom', 'left', 'right']}>
      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <Pagination active={step} />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing.xl,
            paddingVertical: spacing.lg,
          }}
        >
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {illustration}
          </View>
          <View
            style={{
              gap: spacing.md,
              alignItems: 'center',
              paddingHorizontal: spacing.sm,
            }}
          >
            <Text
              variant="display"
              weight="bold"
              style={{
                fontSize: 28,
                lineHeight: 38,
                textAlign: 'center',
              }}
            >
              {title}
            </Text>
            <Text
              variant="body"
              color={lightColors.textSub}
              style={{
                fontSize: 15,
                lineHeight: 24,
                textAlign: 'center',
              }}
            >
              {body}
            </Text>
          </View>
        </View>

        <View style={{ gap: spacing.sm, paddingBottom: spacing.md }}>
          <Button label={ctaLabel} size="lg" fullWidth onPress={onNext} />
          {showBack && step > 1 && (
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{ paddingVertical: spacing.sm, alignItems: 'center' }}
            >
              <Text variant="body" color={lightColors.textSub}>
                이전
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Screen>
  );
}

function Pagination({ active }: { active: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
      }}
    >
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const isActive = i + 1 === active;
        return (
          <View
            key={i}
            style={{
              width: isActive ? 22 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: isActive
                ? lightColors.primary
                : lightColors.border,
            }}
          />
        );
      })}
    </View>
  );
}
