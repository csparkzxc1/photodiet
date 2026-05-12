import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { GroupCard } from '@/components/GroupCard';
import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import {
  countPhotos,
  getPhoto,
  getUnresolvedGroups,
  type GroupRow,
  type PhotoRow,
} from '@/db/queries';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

type GroupWithBest = { group: GroupRow; bestPhoto: PhotoRow | null };

export default function HomeScreen() {
  const [items, setItems] = useState<GroupWithBest[]>([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [groups, total] = await Promise.all([
      getUnresolvedGroups(),
      countPhotos(),
    ]);
    const withBest = await Promise.all(
      groups.map(async (g) => ({
        group: g,
        bestPhoto: g.best_photo_id ? await getPhoto(g.best_photo_id) : null,
      })),
    );
    setItems(withBest);
    setPhotoCount(total);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <Screen padded={false}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.group.id)}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.md,
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.lg, gap: spacing.xs }}>
            <Text variant="display">{ko.app.name}</Text>
            <Text variant="caption" color={lightColors.textSub}>
              {photoCount > 0 ? `${photoCount.toLocaleString('ko-KR')}장 보관 중` : ko.app.tagline}
            </Text>
            <View style={{ marginTop: spacing.lg }}>
              <Text variant="title">{ko.home.title}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{ gap: spacing.md }}>
              <Text variant="body" color={lightColors.textSub}>
                {ko.home.empty}
              </Text>
              <Button
                label="다시 스캔하기"
                variant="secondary"
                onPress={() => router.push('/modal/scan-progress')}
              />
            </View>
          ) : (
            <Text variant="body" color={lightColors.textSub}>
              {ko.common.loading}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <GroupCard
            group={item.group}
            bestPhoto={item.bestPhoto}
            onPress={() => router.push({ pathname: '/group/[id]', params: { id: String(item.group.id) } })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </Screen>
  );
}
