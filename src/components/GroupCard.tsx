import { CaretRight, Star } from 'phosphor-react-native';
import { Pressable, View } from 'react-native';

import { AssetImage } from '@/components/AssetImage';
import { Text } from '@/components/ui';
import type { GroupRow, PhotoRow } from '@/db/queries';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';
import { formatBytes, formatDateKo } from '@/utils/format';

type Props = {
  group: GroupRow;
  bestPhoto: PhotoRow | null;
  reclaimableBytes: number;
  onPress: () => void;
};

const THUMB_SIZE = 72;

export function GroupCard({
  group,
  bestPhoto,
  reclaimableBytes,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`그룹 ${group.id} 정리하기`}
      style={({ pressed }) => ({
        backgroundColor: lightColors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        opacity: pressed ? 0.85 : 1,
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
      })}
    >
      {/* Thumbnail with stack effect */}
      <View
        style={{
          width: THUMB_SIZE + 8,
          height: THUMB_SIZE + 8,
          position: 'relative',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}
      >
        {/* Back stack layers */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: radius.md,
            backgroundColor: lightColors.borderSoft,
            transform: [{ rotate: '4deg' }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 2,
            right: 4,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: radius.md,
            backgroundColor: lightColors.border,
            transform: [{ rotate: '-2deg' }],
          }}
        />
        {/* Main thumbnail */}
        <View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: radius.md,
            overflow: 'hidden',
            backgroundColor: lightColors.border,
          }}
        >
          {bestPhoto && (
            <AssetImage
              assetId={bestPhoto.asset_id}
              style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
            />
          )}
        </View>
        {/* Best badge over thumbnail */}
        <View
          style={{
            position: 'absolute',
            bottom: -4,
            left: -4,
            backgroundColor: lightColors.primary,
            borderRadius: 999,
            paddingVertical: 3,
            paddingHorizontal: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Star size={9} color="#FFFFFF" weight="fill" />
          <Text
            variant="caption"
            color="#FFFFFF"
            weight="bold"
            style={{ fontSize: 10, lineHeight: 12 }}
          >
            베스트
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="title" weight="bold" style={{ fontSize: 16 }}>
          {group.location_cluster ?? '비슷한 사진'}
        </Text>
        <Text variant="caption" color={lightColors.textSub}>
          {formatDateKo(group.started_at)}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            marginTop: 4,
          }}
        >
          <Chip label={`${group.photo_count}장`} tone="coral" />
          {reclaimableBytes > 0 && (
            <Chip
              label={`-${formatBytes(reclaimableBytes)}`}
              tone="green"
            />
          )}
        </View>
      </View>

      {/* Right arrow */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Text
          variant="caption"
          weight="semibold"
          color={lightColors.primary}
          style={{ fontSize: 13 }}
        >
          정리하기
        </Text>
        <CaretRight size={12} color={lightColors.primary} weight="bold" />
      </View>
    </Pressable>
  );
}

type ChipProps = { label: string; tone: 'coral' | 'green' };

function Chip({ label, tone }: ChipProps) {
  const bg = tone === 'coral' ? lightColors.primaryTint : lightColors.accentTint;
  const fg = tone === 'coral' ? lightColors.primary : lightColors.accent;
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
      }}
    >
      <Text
        variant="caption"
        weight="semibold"
        color={fg}
        style={{ fontSize: 11 }}
      >
        {label}
      </Text>
    </View>
  );
}
