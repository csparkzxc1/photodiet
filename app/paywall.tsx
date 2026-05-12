import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import {
  configurePurchases,
  getOffering,
  purchase,
  restorePurchases,
  type Offering,
} from '@/services/purchases';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';

type Selection = 'lifetime' | 'monthly';

export default function PaywallScreen() {
  const [offering, setOffering] = useState<Offering | null>(null);
  const [selection, setSelection] = useState<Selection>('lifetime');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    configurePurchases();
    getOffering().then(setOffering);
  }, []);

  const onPurchase = async () => {
    const pkg = selection === 'lifetime' ? offering?.lifetime : offering?.monthly;
    if (!pkg) {
      setError('상품 정보를 불러오지 못했어요.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await purchase(pkg);
      router.back();
    } catch (e) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        setError(err.message ?? ko.common.error);
      }
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    setBusy(true);
    setError(null);
    try {
      const plan = await restorePurchases();
      if (plan === 'free') {
        setError('복원할 결제가 없어요.');
      } else {
        router.back();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : ko.common.error);
    } finally {
      setBusy(false);
    }
  };

  const lifetimePrice = offering?.lifetime?.product.priceString ?? ko.paywall.lifetime.price;
  const monthlyPrice = offering?.monthly?.product.priceString ?? ko.paywall.monthly.price;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.xs, marginTop: spacing.lg }}>
          <Text variant="display">{ko.paywall.title}</Text>
          <Text variant="body" color={lightColors.textSub}>
            {ko.paywall.subtitle}
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <PlanCard
            selected={selection === 'lifetime'}
            label={ko.paywall.lifetime.label}
            price={lifetimePrice}
            sub={ko.paywall.lifetime.sub}
            badge={ko.paywall.lifetime.badge}
            onPress={() => setSelection('lifetime')}
          />
          <PlanCard
            selected={selection === 'monthly'}
            label={ko.paywall.monthly.label}
            price={monthlyPrice}
            sub={ko.paywall.monthly.sub}
            onPress={() => setSelection('monthly')}
          />
        </View>

        {error && (
          <Text variant="caption" color={lightColors.warning}>
            {error}
          </Text>
        )}

        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          <Button
            label="구매하기"
            size="lg"
            fullWidth
            loading={busy}
            onPress={onPurchase}
          />
          <Button
            label={ko.paywall.restore}
            variant="ghost"
            size="md"
            fullWidth
            disabled={busy}
            onPress={onRestore}
          />
          <Button
            label={ko.common.cancel}
            variant="ghost"
            size="sm"
            fullWidth
            disabled={busy}
            onPress={() => router.back()}
          />
        </View>

        <Text variant="caption" color={lightColors.textTertiary} style={{ marginTop: spacing.md }}>
          {ko.paywall.legal}
        </Text>
      </ScrollView>
    </Screen>
  );
}

type PlanCardProps = {
  selected: boolean;
  label: string;
  price: string;
  sub: string;
  badge?: string;
  onPress: () => void;
};

function PlanCard({ selected, label, price, sub, badge, onPress }: PlanCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={{
        borderRadius: radius.lg,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? lightColors.primary : lightColors.border,
        padding: spacing.md,
        backgroundColor: lightColors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: selected ? lightColors.primary : lightColors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: lightColors.primary,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text variant="title">{label}</Text>
          {badge && (
            <View
              style={{
                backgroundColor: lightColors.primary,
                borderRadius: 999,
                paddingVertical: 2,
                paddingHorizontal: 8,
              }}
            >
              <Text variant="caption" color="#FFFFFF" weight="bold">
                {badge}
              </Text>
            </View>
          )}
        </View>
        <Text variant="caption" color={lightColors.textSub} style={{ marginTop: 2 }}>
          {sub}
        </Text>
      </View>
      <Text variant="title" weight="bold">
        {price}
      </Text>
    </Pressable>
  );
}
