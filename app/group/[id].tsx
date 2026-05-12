import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { AssetImage } from '@/components/AssetImage';
import { BestPhotoBadge } from '@/components/BestPhotoBadge';
import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import {
  getGroup,
  getPhotosInGroup,
  type GroupRow,
  type PhotoRow,
} from '@/db/queries';
import { resolveGroup, type ResolveAction } from '@/services/cleanup';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';
import { formatDateKo, formatMB } from '@/utils/format';

export default function GroupDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<GroupRow | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(groupId)) return;
    const [g, ps] = await Promise.all([getGroup(groupId), getPhotosInGroup(groupId)]);
    setGroup(g);
    setPhotos(ps);
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const best = useMemo(() => {
    if (!group?.best_photo_id) return null;
    return photos.find((p) => p.id === group.best_photo_id) ?? null;
  }, [group, photos]);

  const similar = useMemo(
    () => photos.filter((p) => p.id !== group?.best_photo_id),
    [photos, group],
  );

  const onAction = useCallback(
    async (action: ResolveAction) => {
      if (!group) return;

      const toDelete: PhotoRow[] =
        action === 'kept_best' ? similar : action === 'deleted_all' ? photos : [];

      if (action === 'kept_all') {
        setBusy(true);
        try {
          await resolveGroup({ groupId: group.id, action, toDelete: [] });
          router.back();
        } catch (e) {
          setError(e instanceof Error ? e.message : ko.common.error);
        } finally {
          setBusy(false);
        }
        return;
      }

      const count = toDelete.length;
      const bytes = toDelete.reduce((sum, p) => sum + (p.file_size ?? 0), 0);
      const mb = formatMB(bytes);

      Alert.alert(
        action === 'kept_best' ? ko.group.actions.keepBest : ko.group.actions.deleteAll,
        ko.group.confirmDelete(count, mb),
        [
          { text: ko.common.cancel, style: 'cancel' },
          {
            text: ko.common.confirm,
            style: 'destructive',
            onPress: async () => {
              setBusy(true);
              try {
                await resolveGroup({ groupId: group.id, action, toDelete });
                router.back();
              } catch (e) {
                setError(e instanceof Error ? e.message : ko.common.error);
              } finally {
                setBusy(false);
              }
            },
          },
        ],
      );
    },
    [group, photos, similar],
  );

  if (!group) {
    return (
      <Screen>
        <Text variant="body" color={lightColors.textSub}>
          {ko.common.loading}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">{group.location_cluster ?? '비슷한 사진'}</Text>
          <Text variant="caption" color={lightColors.textSub}>
            {formatDateKo(group.started_at)} · {ko.home.groupCard.count(group.photo_count)}
          </Text>
        </View>

        {best && (
          <View style={{ gap: spacing.sm }}>
            <BestPhotoBadge />
            <View
              style={{
                borderRadius: radius.lg,
                overflow: 'hidden',
                backgroundColor: lightColors.border,
                aspectRatio: 1,
              }}
            >
              <AssetImage
                assetId={best.asset_id}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
          </View>
        )}

        <View style={{ gap: spacing.sm }}>
          <Text variant="caption" color={lightColors.textSub}>
            {ko.group.similarLabel} ({similar.length})
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {similar.map((p) => (
              <View
                key={p.id}
                style={{
                  width: '23%',
                  aspectRatio: 1,
                  backgroundColor: lightColors.border,
                  borderRadius: radius.sm,
                  overflow: 'hidden',
                  opacity: 0.85,
                }}
              >
                <AssetImage
                  assetId={p.asset_id}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            ))}
          </View>
        </View>

        {error && (
          <Text variant="caption" color={lightColors.warning}>
            {error}
          </Text>
        )}

        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Button
            label={ko.group.actions.keepBest}
            size="lg"
            fullWidth
            loading={busy}
            onPress={() => onAction('kept_best')}
          />
          <Button
            label={ko.group.actions.keepAll}
            variant="secondary"
            size="lg"
            fullWidth
            disabled={busy}
            onPress={() => onAction('kept_all')}
          />
          <Button
            label={ko.group.actions.deleteAll}
            variant="danger"
            size="lg"
            fullWidth
            disabled={busy}
            onPress={() => onAction('deleted_all')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
