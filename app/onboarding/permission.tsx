import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { PermissionIllustration } from '@/components/onboarding/illustrations/PermissionIllustration';
import { Screen, Text, Button } from '@/components/ui';
import { ko } from '@/copy/ko';
import { openAppSettings, requestPermission } from '@/services/photos';
import { useSettingsStore } from '@/stores/settingsStore';
import { lightColors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

export default function PermissionScreen() {
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  const setOnboardingCompleted = useSettingsStore(
    (s) => s.setOnboardingCompleted,
  );

  const onRequest = async () => {
    setBusy(true);
    try {
      const state = await requestPermission();
      if (state.status === 'granted' && state.accessPrivileges === 'all') {
        await setOnboardingCompleted(true);
        router.replace('/modal/scan-progress');
        return;
      }
      setDenied(true);
    } finally {
      setBusy(false);
    }
  };

  if (denied) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']}>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ gap: spacing.md, marginTop: spacing.xxl }}>
            <Text variant="display" weight="bold">
              사진첩 전체 접근이 필요해요
            </Text>
            <Text variant="body" color={lightColors.textSub}>
              {ko.onboarding.permission.denied}
            </Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            <Button
              label="설정 앱 열기"
              size="lg"
              fullWidth
              onPress={openAppSettings}
            />
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{ paddingVertical: spacing.sm, alignItems: 'center' }}
            >
              <Text variant="body" color={lightColors.textSub}>
                이전
              </Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <OnboardingFrame
      step={6}
      illustration={<PermissionIllustration />}
      title={'사진첩을 분석해\n비울 용량을 알려드릴게요'}
      body="분석은 기기 안에서만 이뤄지며, 사진은 앱 밖으로 나가지 않습니다."
      ctaLabel={busy ? '권한 요청 중...' : '사진첩 분석 시작하기'}
      onNext={onRequest}
    />
  );
}
