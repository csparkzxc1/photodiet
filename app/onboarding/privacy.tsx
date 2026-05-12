import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

export default function PrivacyScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Text variant="display">{ko.onboarding.privacy.title}</Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            {ko.onboarding.privacy.bullets.map((bullet) => (
              <View
                key={bullet}
                style={{ flexDirection: 'row', gap: spacing.sm }}
              >
                <Text variant="body" color={lightColors.accent}>
                  ●
                </Text>
                <Text variant="body">{bullet}</Text>
              </View>
            ))}
          </View>
        </View>
        <Button
          label={ko.onboarding.privacy.cta}
          size="lg"
          fullWidth
          onPress={() => router.push('/onboarding/permission')}
        />
      </View>
    </Screen>
  );
}
