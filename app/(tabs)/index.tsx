import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { GroupCard } from '@/components/GroupCard';
import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import {
  getPhoto,
  getReclaimableSummary,
  getUnresolvedGroups,
  type GroupRow,
  type PhotoRow,
  type ReclaimableSummary,
} from '@/db/queries';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';
import { formatBytes } from '@/utils/format';

type GroupWithBest = { group: GroupRow; bestPhoto: PhotoRow | null };

export default function HomeScreen() {
  const [items, setItems] = useState<GroupWithBest[]>([]);
  const [summary, setSummary] = useState<ReclaimableSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [groups, recl] = await Promise.all([
      getUnresolvedGroups(),
      getReclaimableSummary(),
    ]);
    const withBest = await Promise.all(
      groups.map(async (g) => ({
        group: g,
        bestPhoto: g.best_photo_id ? await getPhoto(g.best_photo_id) : null,
      })),
    );
    setItems(withBest);
    setSummary(recl);
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

  const startCleanup = useCallback(() => {
    if (summary?.firstGroupId) {
      router.push({
        pathname: '/group/[id]',
        params: { id: String(summary.firstGroupId) },
      });
    }
  }, [summary]);

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
          <View style={{ marginBottom: spacing.lg, gap: spacing.lg }}>
            <Text variant="caption" color={lightColors.textSub}>
              {ko.app.name}
            </Text>
            <Hero
              summary={summary}
              loading={loading}
              onStart={startCleanup}
            />
            {items.length > 0 && (
              <Text variant="title" style={{ marginTop: spacing.sm }}>
                {ko.home.title}
              </Text>
            )}
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
            onPress={() =>
              router.push({
                pathname: '/group/[id]',
                params: { id: String(item.group.id) },
              })
            }
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </Screen>
  );
}

type HeroProps = {
  summary: ReclaimableSummary | null;
  loading: boolean;
  onStart: () => void;
};

function Hero({ summary, loading, onStart }: HeroProps) {
  const hasGroups = (summary?.groupCount ?? 0) > 0;
  const reclaimable = summary?.reclaimableBytes ?? 0;
  const totalPhotos = summary?.totalPhotos ?? 0;
  const removable = summary?.removablePhotos ?? 0;

  const sizeLabel = reclaimable > 0 ? formatBytes(reclaimable) : null;

  return (
    <View
      style={{
        backgroundColor: lightColors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: lightColors.border,
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      {loading ? (
        <Text variant="body" color={lightColors.textSub}>
          {ko.common.loading}
        </Text>
      ) : hasGroups ? (
        <>
          <View style={{ gap: spacing.xs }}>
            <Text variant="caption" color={lightColors.textSub}>
              확보 가능한 용량
            </Text>
            <Text
              variant="display"
              weight="bold"
              color={lightColors.primary}
              style={{ fontSize: 56, lineHeight: 64 }}
            >
              {sizeLabel ?? `${removable.toLocaleString('ko-KR')}장`}
            </Text>
            <Text variant="body" color={lightColors.textSub}>
              {sizeLabel
                ? ko.home.hero.reclaimableSub(totalPhotos, removable)
                : ko.home.hero.reclaimableFallback(removable)}
            </Text>
          </View>
          <Button
            label={ko.home.hero.cta}
            size="lg"
            fullWidth
            onPress={onStart}
          />
          <Text
            variant="caption"
            color={lightColors.textTertiary}
            style={{ textAlign: 'center' }}
          >
            🔒 {ko.home.hero.privacyNote}
          </Text>
        </>
      ) : (
        <View style={{ gap: spacing.sm }}>
          <Text variant="title">{ko.app.tagline}</Text>
          <Text variant="body" color={lightColors.textSub}>
            {ko.home.empty}
          </Text>
        </View>
      )}
    </View>
  );
}
