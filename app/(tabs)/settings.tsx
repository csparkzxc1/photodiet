import { Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';

export default function SettingsScreen() {
  return (
    <Screen scroll>
      <Text variant="display">{ko.settings.plan}</Text>
    </Screen>
  );
}
