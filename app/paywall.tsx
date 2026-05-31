import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

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

export default function PaywallScreen() {
  const [offering, setOffering] = useState<Offering | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    configurePurchases();
    getOffering().then(setOffering);
  }, []);

  const onPurchase = async () => {
    const pkg = offering?.lifetime;
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

  const price = offering?.lifetime?.product.priceString ?? ko.paywall.lifetime.price;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
          <Text variant="display">{ko.paywall.title}</Text>
          <Text variant="body" color={lightColors.textSub}>
            {ko.paywall.subtitle}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: lightColors.surface,
            borderRadius: radius.xl,
            borderWidth: 2,
            borderColor: lightColors.primary,
            padding: spacing.lg,
            gap: spacing.md,
          }}
        >
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: lightColors.primary,
              borderRadius: 999,
              paddingVertical: 4,
              paddingHorizontal: spacing.md,
            }}
          >
            <Text variant="caption" color="#FFFFFF" weight="bold">
              {ko.paywall.lifetime.badge}
            </Text>
          </View>
          <Text variant="stat" weight="bold">
            {price}
          </Text>
          <Text variant="caption" color={lightColors.textSub}>
            {ko.paywall.lifetime.sub}
          </Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            {ko.paywall.bullets.map((bullet) => (
              <View
                key={bullet}
                style={{ flexDirection: 'row', gap: spacing.sm }}
              >
                <Text variant="body" color={lightColors.accent}>
                  ✓
                </Text>
                <Text variant="body">{bullet}</Text>
              </View>
            ))}
          </View>
        </View>

        {error && (
          <Text variant="caption" color={lightColors.warning}>
            {error}
          </Text>
        )}

        <View style={{ gap: spacing.sm }}>
          <Button
            label={ko.paywall.cta}
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

        <Text
          variant="caption"
          color={lightColors.textTertiary}
          style={{ marginTop: spacing.md }}
        >
          {ko.paywall.legal}
        </Text>
      </ScrollView>
    </Screen>
  );
}
