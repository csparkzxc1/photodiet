import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';

import { Card, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { restorePurchases } from '@/services/purchases';
import {
  FREE_QUOTA,
  isPaid,
  useSettingsStore,
} from '@/stores/settingsStore';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

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

  const planLabel = (() => {
    if (plan === 'lifetime') return '평생 사용';
    return `무료 (${freeQuotaUsed}/${FREE_QUOTA})`;
  })();

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg }}>
        <Text variant="display">설정</Text>

        <Card padded>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text variant="caption" color={lightColors.textSub}>
                {ko.settings.plan}
              </Text>
              <Text variant="title" style={{ marginTop: 4 }}>
                {planLabel}
              </Text>
            </View>
            {!isPaid(plan) && (
              <Pressable onPress={() => router.push('/paywall')} hitSlop={8}>
                <Text variant="caption" color={lightColors.primary} weight="semibold">
                  업그레이드 →
                </Text>
              </Pressable>
            )}
          </View>
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Row label={ko.settings.restore} disabled={busy} onPress={onRestore} />
          <Row
            label={ko.settings.privacy}
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <Row label={ko.settings.terms} onPress={() => Linking.openURL(TERMS_URL)} />
          <Row
            label={ko.settings.contact}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          />
        </View>

        <Text variant="caption" color={lightColors.textTertiary} style={{ marginTop: spacing.xl }}>
          {ko.settings.version} {Constants.expoConfig?.version ?? '0.1.0'}
        </Text>
      </View>
    </Screen>
  );
}

type RowProps = {
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

function Row({ label, disabled, onPress }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        backgroundColor: lightColors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: lightColors.border,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      })}
    >
      <Text variant="body">{label}</Text>
      <Text variant="body" color={lightColors.textTertiary}>
        ›
      </Text>
    </Pressable>
  );
}
