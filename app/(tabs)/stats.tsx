import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { getStatsSummary, type StatsSummary } from '@/services/stats';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';
import { formatBytes, formatGB } from '@/utils/format';

const CHART_HEIGHT = 120;
const BAR_WIDTH = 14;
const DAYS_SHOWN = 9;

export default function StatsScreen() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      getStatsSummary(DAYS_SHOWN).then(setSummary);
    }, []),
  );

  if (!summary) {
    return (
      <Screen edges={['top', 'left', 'right']}>
        <Text variant="body" color={lightColors.textSub}>
          {ko.common.loading}
        </Text>
      </Screen>
    );
  }

  const maxBytes = Math.max(1, ...summary.daily.map((d) => d.bytesFreed));
  const totalGb = formatGB(summary.totalBytesFreed);

  return (
    <Screen padded={false} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.lg,
        }}
      >
        <View style={{ gap: 4 }}>
          <Text variant="display" weight="bold" style={{ fontSize: 28 }}>
            통계
          </Text>
          <Text variant="body" color={lightColors.textSub}>
            지금까지 정리한 기록이에요
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <StatCard
            icon="🗑️"
            value={summary.totalDeleted.toLocaleString('ko-KR')}
            unit="장"
            label="삭제한 사진"
            valueColor={lightColors.primary}
          />
          <StatCard
            icon="💾"
            value={String(formatGB(summary.totalBytesFreed))}
            unit="GB"
            label="확보한 용량"
            valueColor={lightColors.accent}
          />
          <StatCard
            icon="✨"
            value={summary.totalGroups.toLocaleString('ko-KR')}
            unit="개"
            label="정리한 그룹"
            valueColor={lightColors.primary}
          />
        </View>

        <View
          style={{
            backgroundColor: lightColors.surface,
            borderRadius: 20,
            padding: spacing.lg,
            gap: spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <Text variant="title" weight="bold">
              최근 절약량
            </Text>
            <Text variant="caption" color={lightColors.textSub}>
              최근 {DAYS_SHOWN}일
            </Text>
          </View>

          <View
            style={{
              height: CHART_HEIGHT,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              paddingHorizontal: 4,
            }}
          >
            {summary.daily.map((d) => {
              const pct = (d.bytesFreed / maxBytes) * 100;
              return (
                <View
                  key={d.dayStartMs}
                  style={{
                    width: BAR_WIDTH,
                    height: `${Math.max(2, pct)}%`,
                    backgroundColor:
                      d.bytesFreed > 0
                        ? lightColors.primary
                        : lightColors.borderSoft,
                    borderRadius: 6,
                  }}
                />
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {summary.daily.map((d) => {
              const date = new Date(d.dayStartMs);
              const label = `${date.getMonth() + 1}/${date.getDate()}`;
              return (
                <Text
                  key={d.dayStartMs}
                  variant="caption"
                  color={lightColors.textTertiary}
                  style={{ fontSize: 10, width: BAR_WIDTH + 12, textAlign: 'center' }}
                >
                  {label}
                </Text>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: lightColors.primary,
              }}
            />
            <Text variant="caption" color={lightColors.textSub}>
              {formatBytes(maxBytes).includes('GB') ? 'GB' : 'MB'} 단위 절약량
            </Text>
          </View>
        </View>

        {summary.totalBytesFreed > 0 && (
          <View
            style={{
              backgroundColor: lightColors.accentTint,
              borderRadius: 20,
              padding: spacing.md,
              flexDirection: 'row',
              gap: spacing.md,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 32 }}>🌱</Text>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="title" weight="bold" style={{ fontSize: 16 }}>
                잘 하고 있어요!
              </Text>
              <Text variant="caption" color={lightColors.textSub}>
                지금까지 {totalGb} GB를 아꼈습니다
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

type StatCardProps = {
  icon: string;
  value: string;
  unit: string;
  label: string;
  valueColor: string;
};

function StatCard({ icon, value, unit, label, valueColor }: StatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: lightColors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        gap: 6,
        alignItems: 'flex-start',
      }}
    >
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
        <Text weight="bold" color={valueColor} style={{ fontSize: 24 }}>
          {value}
        </Text>
        <Text
          weight="medium"
          color={valueColor}
          style={{ fontSize: 12 }}
        >
          {unit}
        </Text>
      </View>
      <Text variant="caption" color={lightColors.textSub} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}
