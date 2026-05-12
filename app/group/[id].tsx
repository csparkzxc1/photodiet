import { useLocalSearchParams } from 'expo-router';

import { Screen, Text } from '@/components/ui';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen>
      <Text variant="title">Group {id ?? '?'}</Text>
    </Screen>
  );
}
