import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

export default function ValueScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Text variant="display">{ko.onboarding.value.title}</Text>
          <Text variant="body" color={lightColors.textSub}>
            {ko.onboarding.value.body}
          </Text>
        </View>
        <Button
          label={ko.onboarding.value.cta}
          size="lg"
          fullWidth
          onPress={() => router.push('/onboarding/privacy')}
        />
      </View>
    </Screen>
  );
}
