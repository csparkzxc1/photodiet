import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { ko } from '@/copy/ko';
import { openAppSettings, requestPermission } from '@/services/photos';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

export default function PermissionScreen() {
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  const onRequest = async () => {
    setBusy(true);
    try {
      const state = await requestPermission();
      if (state.status === 'granted' && state.accessPrivileges === 'all') {
        router.replace('/onboarding/ready');
        return;
      }
      if (state.status === 'granted' && state.accessPrivileges === 'limited') {
        setDenied(true);
        return;
      }
      setDenied(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
          <Text variant="display">{ko.onboarding.permission.title}</Text>
          <Text variant="body" color={lightColors.textSub}>
            {ko.onboarding.permission.body}
          </Text>
          {denied && (
            <Text variant="caption" color={lightColors.warning}>
              {ko.onboarding.permission.denied}
            </Text>
          )}
        </View>
        <View style={{ gap: spacing.sm }}>
          <Button
            label={ko.onboarding.permission.cta}
            size="lg"
            fullWidth
            loading={busy}
            onPress={onRequest}
          />
          {denied && (
            <Button
              label="설정 앱 열기"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={openAppSettings}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
