import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { indexAllPhotos } from '@/services/photos';
import { runFullScan } from '@/services/scanRunner';
import { useScanStore } from '@/stores/scanStore';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

export default function ScanProgressScreen() {
  const phase = useScanStore((s) => s.phase);
  const indexProgress = useScanStore((s) => s.indexProgress);
  const analyzeProgress = useScanStore((s) => s.analyzeProgress);
  const errorMessage = useScanStore((s) => s.errorMessage);
  const groupCount = useScanStore((s) => s.groupCount);

  const abortRef = useRef({ aborted: false });

  useEffect(() => {
    abortRef.current = { aborted: false };
    runFullScan(abortRef.current, { indexAllPhotos }).catch(() => undefined);
    return () => {
      abortRef.current.aborted = true;
    };
  }, []);

  const indexPct =
    indexProgress.total > 0
      ? Math.round((indexProgress.scanned / indexProgress.total) * 100)
      : 0;
  const analyzePct =
    analyzeProgress.total > 0
      ? Math.round((analyzeProgress.done / analyzeProgress.total) * 100)
      : 0;

  const phaseLabel = (() => {
    switch (phase) {
      case 'idle':
        return ko.home.scanning;
      case 'indexing':
        return `사진 정리 중... ${indexProgress.scanned} / ${indexProgress.total}`;
      case 'analyzing':
        return `사진 분석 중... ${analyzeProgress.done} / ${analyzeProgress.total}`;
      case 'clustering':
        return '비슷한 사진을 묶는 중...';
      case 'done':
        return `완료! ${groupCount}개 그룹을 찾았어요.`;
      case 'error':
        return ko.common.error;
    }
  })();

  const overallPct =
    phase === 'indexing'
      ? indexPct
      : phase === 'analyzing'
        ? analyzePct
        : phase === 'done'
          ? 100
          : 0;

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Text variant="display">{ko.onboarding.ready.title}</Text>
          <Text variant="body" color={lightColors.textSub}>
            {phaseLabel}
          </Text>
          {errorMessage && (
            <Text variant="caption" color={lightColors.warning}>
              {errorMessage}
            </Text>
          )}

          <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
            <View
              style={{
                height: 8,
                backgroundColor: lightColors.border,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${overallPct}%`,
                  height: '100%',
                  backgroundColor: lightColors.primary,
                }}
              />
            </View>
            <Text variant="caption" color={lightColors.textSub}>
              {overallPct}%
            </Text>
          </View>

          {(phase === 'idle' || phase === 'indexing' || phase === 'analyzing' || phase === 'clustering') && (
            <ActivityIndicator color={lightColors.primary} style={{ marginTop: spacing.lg }} />
          )}
        </View>

        {(phase === 'done' || phase === 'error') && (
          <Button
            label={phase === 'done' ? '확인' : ko.common.retry}
            size="lg"
            fullWidth
            onPress={() => {
              if (phase === 'done') {
                router.replace('/(tabs)');
              } else {
                abortRef.current = { aborted: false };
                runFullScan(abortRef.current, { indexAllPhotos }).catch(() => undefined);
              }
            }}
          />
        )}
      </View>
    </Screen>
  );
}
