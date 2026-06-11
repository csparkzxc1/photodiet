import Constants from 'expo-constants';
import { router } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { resetDatabase } from '@/db/client';
import { restorePurchases } from '@/services/purchases';
import { FREE_QUOTA, isPaid, useSettingsStore } from '@/stores/settingsStore';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';

const SUPPORT_EMAIL = 'support@photodiet.app';
const PRIVACY_URL = 'https://photodiet.app/privacy';
const TERMS_URL = 'https://photodiet.app/terms';

export default function SettingsScreen() {
  const { plan, freeQuotaUsed } = useSettingsStore();
  const [busy, setBusy] = useState(false);

  const onRestore = async () => {
    setBusy(true);
    try {
      const result = await restorePurchases();
      Alert.alert(
        '복원 완료',
        result === 'free' ? '복원할 결제가 없어요.' : '결제가 복원되었어요.',
      );
    } catch (err) {
      Alert.alert(
        ko.common.error,
        err instanceof Error ? err.message : '복원에 실패했어요.',
      );
    } finally {
      setBusy(false);
    }
  };

  const onClearCache = () => {
    Alert.alert(
      '분석 캐시 지우기',
      '인덱스와 분석 결과가 모두 지워집니다. 사진앱의 원본은 영향 없어요.\n다음 진입 시 다시 스캔합니다.',
      [
        { text: ko.common.cancel, style: 'cancel' },
        {
          text: ko.common.confirm,
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            Alert.alert('완료', '캐시가 초기화되었어요. 앱을 다시 시작해주세요.');
          },
        },
      ],
    );
  };

  return (
    <Screen padded={false} scroll edges={['top', 'left', 'right']}>
      <View style={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text variant="display" weight="bold" style={{ fontSize: 28 }}>
          설정
        </Text>

        <PlanBanner
          plan={plan}
          used={freeQuotaUsed}
          onPress={() => router.push('/paywall')}
        />

        <Section title="계정">
          <Row
            icon="🔄"
            label={ko.settings.restore}
            disabled={busy}
            onPress={onRestore}
          />
          <Row
            icon="✉️"
            label={ko.settings.contact}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          />
        </Section>

        <Section title="앱 정보">
          <Row
            icon="🔒"
            label={ko.settings.privacy}
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <Row
            icon="📋"
            label={ko.settings.terms}
            onPress={() => Linking.openURL(TERMS_URL)}
          />
          <Row
            icon="ℹ️"
            label={ko.settings.version}
            right={
              <Text variant="caption" color={lightColors.textTertiary}>
                {Constants.expoConfig?.version ?? '0.1.0'}
              </Text>
            }
          />
        </Section>

        <Section title="데이터">
          <Row icon="🗑️" label="분석 캐시 지우기" onPress={onClearCache} />
        </Section>

        <Text
          variant="caption"
          color={lightColors.textTertiary}
          style={{ textAlign: 'center', paddingHorizontal: spacing.md, marginTop: spacing.md }}
        >
          사진다이어트는 사진을 외부 서버로 전송하지 않습니다.{'\n'}모든 처리는 내 기기 안에서만 이루어집니다.
        </Text>
      </View>
    </Screen>
  );
}

type PlanBannerProps = {
  plan: 'free' | 'lifetime';
  used: number;
  onPress: () => void;
};

function PlanBanner({ plan, used, onPress }: PlanBannerProps) {
  if (isPaid(plan)) {
    return (
      <View
        style={{
          backgroundColor: lightColors.accentTint,
          borderRadius: radius.lg,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="title" weight="bold" color={lightColors.accent} style={{ fontSize: 16 }}>
            평생 사용 중
          </Text>
          <Text variant="caption" color={lightColors.textSub}>
            모든 기능을 이용할 수 있어요
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: lightColors.primaryTint,
        borderRadius: radius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="title" weight="bold" color={lightColors.primary} style={{ fontSize: 16 }}>
          무료 체험 중
        </Text>
        <Text variant="caption" color={lightColors.textSub}>
          {used >= FREE_QUOTA
            ? '정리 기능을 사용하려면 구매가 필요해요'
            : `남은 무료 정리 ${FREE_QUOTA - used}회`}
        </Text>
      </View>
      <Button label="구매" size="sm" onPress={onPress} />
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text
        variant="caption"
        color={lightColors.textSub}
        style={{ paddingHorizontal: spacing.xs }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: lightColors.surface,
          borderRadius: radius.lg,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}

type RowProps = {
  icon: string;
  label: string;
  disabled?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
};

function Row({ icon, label, disabled, right, onPress }: RowProps) {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || !onPress;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        borderTopWidth: 0.5,
        borderTopColor: lightColors.borderSoft,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: spacing.md,
        }}
      >
        <Text style={{ fontSize: 18, marginRight: spacing.md }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text variant="body">{label}</Text>
        </View>
        {right ??
          (onPress ? (
            <CaretRight size={14} color={lightColors.textTertiary} weight="bold" />
          ) : null)}
      </View>
    </Pressable>
  );
}
