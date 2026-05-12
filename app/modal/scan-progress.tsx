import { Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';

export default function ScanProgressScreen() {
  return (
    <Screen>
      <Text variant="title">{ko.home.scanning}</Text>
    </Screen>
  );
}
