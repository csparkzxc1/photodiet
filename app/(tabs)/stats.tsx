import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Card, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { getStatsSummary, type StatsSummary } from '@/services/stats';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';
import { formatBytes } from '@/utils/format';

export default function StatsScreen() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      getStatsSummary().then(setSummary);
    }, []),
  );

  if (!summary) {
    return (
      <Screen>
        <Text variant="body" color={lightColors.textSub}>
          {ko.common.loading}
        </Text>
      </Screen>
    );
  }

  const maxBytes = Math.max(1, ...summary.daily.map((d) => d.bytesFreed));

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text variant="display">{ko.stats.title}</Text>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Card padded style={{ flex: 1 }}>
            <Text variant="caption" color={lightColors.textSub}>
              {ko.stats.totalDeleted}
            </Text>
            <Text variant="stat" style={{ marginTop: spacing.xs }}>
              {summary.totalDeleted.toLocaleString('ko-KR')}
            </Text>
          </Card>
          <Card padded style={{ flex: 1 }}>
            <Text variant="caption" color={lightColors.textSub}>
              {ko.stats.totalFreed}
            </Text>
            <Text variant="stat" style={{ marginTop: spacing.xs }}>
              {formatBytes(summary.totalBytesFreed)}
            </Text>
          </Card>
        </View>

        <Card padded>
          <Text variant="caption" color={lightColors.textSub}>
            {ko.stats.totalGroups}
          </Text>
          <Text variant="stat" style={{ marginTop: spacing.xs }}>
            {summary.totalGroups.toLocaleString('ko-KR')}
          </Text>
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Text variant="title">{ko.stats.chartTitle}</Text>
          <View
            style={{
              backgroundColor: lightColors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: lightColors.border,
              padding: spacing.md,
              height: 160,
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 3,
            }}
          >
            {summary.daily.map((d) => {
              const pct = (d.bytesFreed / maxBytes) * 100;
              return (
                <View
                  key={d.dayStartMs}
                  style={{
                    flex: 1,
                    height: `${Math.max(2, pct)}%`,
                    backgroundColor:
                      d.bytesFreed > 0 ? lightColors.primary : lightColors.border,
                    borderRadius: 2,
                  }}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
