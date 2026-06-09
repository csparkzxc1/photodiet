import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { useRewardStore } from '@/stores/rewardStore';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';
import { formatBytes } from '@/utils/format';

const AUTO_HIDE_MS = 3000;

export function RewardToast() {
  const { visible, bytesFreed, totalBytesFreed, hide } = useRewardStore();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 16 });
      opacity.value = withTiming(1, { duration: 200 });
      const timer = setTimeout(() => {
        translateY.value = withTiming(-120, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        setTimeout(hide, 220);
      }, AUTO_HIDE_MS);
      return () => clearTimeout(timer);
    }
  }, [visible, hide, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const freed = formatBytes(bytesFreed);
  const total = formatBytes(totalBytesFreed);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 60,
          left: spacing.lg,
          right: spacing.lg,
          zIndex: 50,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          backgroundColor: lightColors.accent,
          borderRadius: radius.lg,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="title" color="#FFFFFF" weight="bold">
            {ko.reward.cleaned(freed)}
          </Text>
          <Text variant="caption" color="rgba(255,255,255,0.85)">
            {ko.reward.totalSaved(total)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
