import { View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

export default function HomeScreen() {
  return (
    <Screen scroll>
      <View style={{ gap: spacing.md }}>
        <Text variant="display" color={lightColors.text}>
          {ko.app.name}
        </Text>
        <Text variant="body" color={lightColors.textSub}>
          {ko.app.tagline}
        </Text>
        <View
          style={{
            marginTop: spacing.xl,
            padding: spacing.lg,
            backgroundColor: lightColors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: lightColors.border,
          }}
        >
          <Text variant="title">{ko.home.title}</Text>
          <Text
            variant="body"
            color={lightColors.textSub}
            style={{ marginTop: spacing.sm }}
          >
            {ko.home.empty}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
