import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

export default function SolutionScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Text variant="display">{ko.onboarding.solution.title}</Text>
          <Text variant="body" color={lightColors.textSub}>
            {ko.onboarding.solution.body}
          </Text>
        </View>
        <Button
          label={ko.onboarding.solution.cta}
          size="lg"
          fullWidth
          onPress={() => router.push('/onboarding/privacy')}
        />
      </View>
    </Screen>
  );
}
