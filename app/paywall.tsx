import { Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';

export default function PaywallScreen() {
  return (
    <Screen>
      <Text variant="display">{ko.paywall.title}</Text>
    </Screen>
  );
}
