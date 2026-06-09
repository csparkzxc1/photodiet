import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Circle, X } from 'phosphor-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { AssetImage } from '@/components/AssetImage';
import { Button, Screen, Text } from '@/components/ui';
import { getAlbums, type AlbumInfo } from '@/services/photos';
import { useSettingsStore } from '@/stores/settingsStore';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';

const ALL_KEY = '__all__';

export default function AlbumPickerScreen() {
  const params = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = params.from === 'onboarding';

  const [albums, setAlbums] = useState<AlbumInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set([ALL_KEY]));

  const stored = useSettingsStore((s) => s.selectedAlbumIds);
  const setSelectedAlbumIds = useSettingsStore((s) => s.setSelectedAlbumIds);

  useEffect(() => {
    if (stored === null || stored.length === 0) {
      setSelected(new Set([ALL_KEY]));
    } else {
      setSelected(new Set(stored));
    }
  }, [stored]);

  useEffect(() => {
    getAlbums()
      .then((list) => {
        setAlbums(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalSelectedCount = useMemo(() => {
    if (selected.has(ALL_KEY)) {
      return albums.reduce((sum, a) => sum + a.assetCount, 0);
    }
    return albums
      .filter((a) => selected.has(a.id))
      .reduce((sum, a) => sum + a.assetCount, 0);
  }, [selected, albums]);

  const toggleAll = useCallback(() => {
    setSelected(new Set([ALL_KEY]));
  }, []);

  const toggleAlbum = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(ALL_KEY);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size === 0) next.add(ALL_KEY);
      return next;
    });
  }, []);

  const onConfirm = useCallback(async () => {
    const isAll = selected.has(ALL_KEY);
    await setSelectedAlbumIds(isAll ? null : Array.from(selected));
    if (fromOnboarding) {
      router.replace('/modal/scan-progress');
    } else {
      router.replace('/modal/scan-progress');
    }
  }, [selected, setSelectedAlbumIds, fromOnboarding]);

  const onClose = useCallback(() => {
    if (fromOnboarding) return;
    router.back();
  }, [fromOnboarding]);

  return (
    <Screen padded={false} edges={['top', 'bottom', 'left', 'right']}>
      <View style={{ flex: 1 }}>
        <Header onClose={fromOnboarding ? null : onClose} />

        <View style={{ paddingHorizontal: spacing.lg, gap: 6 }}>
          <Text variant="display" weight="bold" style={{ fontSize: 24 }}>
            어떤 사진첩을 분석할까요?
          </Text>
          <Text variant="body" color={lightColors.textSub}>
            여러 개를 선택할 수 있어요
          </Text>
        </View>

        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: 140,
            gap: 8,
          }}
          ListHeaderComponent={
            <AlbumRow
              label="전체 사진첩"
              subtitle={`${albums.reduce((s, a) => s + a.assetCount, 0).toLocaleString('ko-KR')}장`}
              selected={selected.has(ALL_KEY)}
              onPress={toggleAll}
              isAll
            />
          }
          ListEmptyComponent={
            !loading ? (
              <Text variant="body" color={lightColors.textSub}>
                불러올 사진첩이 없습니다.
              </Text>
            ) : (
              <Text variant="body" color={lightColors.textSub}>
                불러오는 중...
              </Text>
            )
          }
          renderItem={({ item }) => (
            <AlbumRow
              label={item.title}
              subtitle={`${item.assetCount.toLocaleString('ko-KR')}장`}
              thumbnailAssetId={item.thumbnailAssetId}
              selected={selected.has(item.id) && !selected.has(ALL_KEY)}
              onPress={() => toggleAlbum(item.id)}
            />
          )}
        />

        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: spacing.lg,
            paddingTop: spacing.md,
            backgroundColor: lightColors.bg,
            gap: 6,
          }}
        >
          <Text
            variant="caption"
            color={lightColors.textSub}
            style={{ textAlign: 'center' }}
          >
            약 {totalSelectedCount.toLocaleString('ko-KR')}장 분석 예정
          </Text>
          <Button
            label="분석 시작"
            size="lg"
            fullWidth
            disabled={loading}
            onPress={onConfirm}
          />
        </View>
      </View>
    </Screen>
  );
}

function Header({ onClose }: { onClose: (() => void) | null }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: spacing.md,
        height: 48,
      }}
    >
      {onClose && (
        <Pressable onPress={onClose} hitSlop={12}>
          <X size={24} color={lightColors.text} weight="bold" />
        </Pressable>
      )}
    </View>
  );
}

type AlbumRowProps = {
  label: string;
  subtitle: string;
  thumbnailAssetId?: string | null;
  selected: boolean;
  onPress: () => void;
  isAll?: boolean;
};

function AlbumRow({
  label,
  subtitle,
  thumbnailAssetId,
  selected,
  onPress,
  isAll = false,
}: AlbumRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => ({
        backgroundColor: selected
          ? lightColors.primaryTint
          : lightColors.surface,
        borderRadius: radius.lg,
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        opacity: pressed ? 0.85 : 1,
        borderWidth: selected ? 2 : 0,
        borderColor: selected ? lightColors.primary : 'transparent',
      })}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: radius.md,
          overflow: 'hidden',
          backgroundColor: lightColors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isAll ? (
          <Text style={{ fontSize: 22 }}>🖼️</Text>
        ) : thumbnailAssetId ? (
          <AssetImage
            assetId={thumbnailAssetId}
            style={{ width: 52, height: 52 }}
          />
        ) : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" weight="semibold" style={{ fontSize: 15 }}>
          {label}
        </Text>
        <Text variant="caption" color={lightColors.textSub}>
          {subtitle}
        </Text>
      </View>
      {selected ? (
        <CheckCircle size={26} color={lightColors.primary} weight="fill" />
      ) : (
        <Circle size={26} color={lightColors.border} weight="regular" />
      )}
    </Pressable>
  );
}

