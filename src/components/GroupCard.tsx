import { Pressable, View } from 'react-native';

import { AssetImage } from '@/components/AssetImage';
import { Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import type { GroupRow, PhotoRow } from '@/db/queries';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';
import { formatDateKo } from '@/utils/format';

type Props = {
  group: GroupRow;
  bestPhoto: PhotoRow | null;
  onPress: () => void;
};

export function GroupCard({ group, bestPhoto, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`그룹 ${group.id} 정리하기`}
      style={({ pressed }) => ({
        backgroundColor: lightColors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: lightColors.border,
        padding: spacing.md,
        opacity: pressed ? 0.85 : 1,
        flexDirection: 'row',
        gap: spacing.md,
      })}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: radius.md,
          overflow: 'hidden',
          backgroundColor: lightColors.border,
        }}
      >
        {bestPhoto && (
          <AssetImage
            assetId={bestPhoto.asset_id}
            style={{ width: 88, height: 88, borderRadius: radius.md }}
          />
        )}
      </View>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text variant="title">{group.location_cluster ?? '비슷한 사진'}</Text>
          <Text variant="caption" color={lightColors.textSub}>
            {formatDateKo(group.started_at)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Text variant="caption" color={lightColors.textSub}>
            {ko.home.groupCard.count(group.photo_count)}
          </Text>
          <Text variant="caption" color={lightColors.primary} weight="semibold">
            {ko.home.groupCard.cta} →
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
