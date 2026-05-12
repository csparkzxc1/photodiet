import { Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';

export default function StatsScreen() {
  return (
    <Screen scroll>
      <Text variant="display">{ko.stats.title}</Text>
    </Screen>
  );
}
