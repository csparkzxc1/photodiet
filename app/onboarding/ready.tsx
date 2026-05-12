import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { useSettingsStore } from '@/stores/settingsStore';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

export default function ReadyScreen() {
  const setOnboardingCompleted = useSettingsStore((s) => s.setOnboardingCompleted);

  const onStart = async () => {
    await setOnboardingCompleted(true);
    router.replace('/modal/scan-progress');
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Text variant="display">{ko.onboarding.ready.title}</Text>
          <Text variant="body" color={lightColors.textSub}>
            {ko.onboarding.ready.body}
          </Text>
        </View>
        <Button
          label={ko.onboarding.ready.cta}
          size="lg"
          fullWidth
          onPress={onStart}
        />
      </View>
    </Screen>
  );
}
