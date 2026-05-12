import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

export default function WelcomeScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Text variant="display">{ko.onboarding.welcome.title}</Text>
          <Text variant="body" color={lightColors.textSub}>
            {ko.onboarding.welcome.body}
          </Text>
        </View>
        <Button
          label={ko.onboarding.welcome.cta}
          size="lg"
          fullWidth
          onPress={() => router.push('/onboarding/value')}
        />
      </View>
    </Screen>
  );
}
