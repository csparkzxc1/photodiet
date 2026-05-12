import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

export default function PermissionScreen() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Text variant="display">{ko.onboarding.permission.title}</Text>
          <Text variant="body" color={lightColors.textSub}>
            {ko.onboarding.permission.body}
          </Text>
        </View>
        <Button
          label={ko.onboarding.permission.cta}
          size="lg"
          fullWidth
          onPress={() => router.push('/onboarding/ready')}
        />
      </View>
    </Screen>
  );
}
