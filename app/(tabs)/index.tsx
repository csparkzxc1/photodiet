import { router, useFocusEffect } from 'expo-router';
import { Stack } from 'phosphor-react-native';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';

import { GroupCard } from '@/components/GroupCard';
import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import {
  getPhoto,
  getPhotosInGroup,
  getReclaimableSummary,
  getUnresolvedGroups,
  type GroupRow,
  type PhotoRow,
  type ReclaimableSummary,
} from '@/db/queries';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';
import { formatBytes } from '@/utils/format';

type GroupItem = {
  group: GroupRow;
  bestPhoto: PhotoRow | null;
  reclaimableBytes: number;
  removableCount: number;
};

export default function HomeScreen() {
  const [items, setItems] = useState<GroupItem[]>([]);
  const [summary, setSummary] = useState<ReclaimableSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [groups, recl] = await Promise.all([
      getUnresolvedGroups(),
      getReclaimableSummary(),
    ]);
    const enriched = await Promise.all(
      groups.map(async (g): Promise<GroupItem> => {
        const [best, photos] = await Promise.all([
          g.best_photo_id ? getPhoto(g.best_photo_id) : Promise.resolve(null),
          getPhotosInGroup(g.id),
        ]);
        const removable = photos.filter((p) => p.id !== g.best_photo_id);
        const reclaimableBytes = removable.reduce(
          (sum, p) => sum + (p.file_size ?? 0),
          0,
        );
        return {
          group: g,
          bestPhoto: best,
          reclaimableBytes,
          removableCount: removable.length,
        };
      }),
    );
    setItems(enriched);
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

  const onRescan = useCallback(() => {
    router.push('/album-picker');
  }, []);

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.group.id)}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.xxl,
          gap: spacing.sm,
        }}
        ListHeaderComponent={
          <View style={{ gap: spacing.lg, marginBottom: spacing.md }}>
            <Header onRescan={onRescan} />
            <Hero
              summary={summary}
              loading={loading}
              onStart={startCleanup}
            />
            {items.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: spacing.sm,
                }}
              >
                <Text variant="title" weight="bold">
                  비슷한 사진 묶음
                </Text>
                <Text variant="caption" color={lightColors.textSub}>
                  {items.length}개 그룹
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View
              style={{
                gap: spacing.md,
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.md,
                backgroundColor: lightColors.surface,
                borderRadius: radius.lg,
              }}
            >
              <Text variant="body" color={lightColors.textSub}>
                {ko.home.empty}
              </Text>
              <Button
                label="다시 스캔하기"
                variant="secondary"
                onPress={onRescan}
              />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <GroupCard
            group={item.group}
            bestPhoto={item.bestPhoto}
            reclaimableBytes={item.reclaimableBytes}
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

function Header({ onRescan }: { onRescan: () => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.sm,
      }}
    >
      <Text variant="display" weight="bold" style={{ fontSize: 26 }}>
        사진다이어트
      </Text>
      <Pressable
        onPress={onRescan}
        accessibilityRole="button"
        accessibilityLabel="다시 스캔"
        hitSlop={12}
      >
        <Stack size={26} color={lightColors.text} weight="duotone" />
      </Pressable>
    </View>
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
        borderRadius: 24,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        gap: spacing.md,
      }}
    >
      {loading ? (
        <Text variant="body" color={lightColors.textSub}>
          {ko.common.loading}
        </Text>
      ) : hasGroups ? (
        <>
          <View style={{ gap: 6 }}>
            <Text
              variant="caption"
              color={lightColors.textSub}
              style={{ fontSize: 14 }}
            >
              지금 비울 수 있는 용량
            </Text>
            <Text
              weight="bold"
              color={lightColors.primary}
              style={{ fontSize: 56, lineHeight: 60 }}
            >
              {sizeLabel ?? `${removable}장`}
            </Text>
            <Text
              variant="body"
              color={lightColors.textSub}
              style={{ fontSize: 14 }}
            >
              {totalPhotos}장에서 {removable}장만 남길 수 있어요
            </Text>
          </View>
          <Button
            label="한 번에 정리 시작"
            size="lg"
            fullWidth
            onPress={onStart}
          />
        </>
      ) : (
        <View style={{ gap: spacing.sm }}>
          <Text variant="title" weight="bold">
            깨끗합니다!
          </Text>
          <Text variant="body" color={lightColors.textSub}>
            {ko.home.empty}
          </Text>
        </View>
      )}
    </View>
  );
}
