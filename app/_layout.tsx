import '../global.css';

import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RewardToast } from '@/components/RewardToast';
import { initDatabase } from '@/db/client';
import { useFonts } from '@/hooks/useFonts';
import { initSentry } from '@/services/sentry';
import { useSettingsStore } from '@/stores/settingsStore';
import { createLogger } from '@/utils/log';

const log = createLogger('root');

SplashScreen.preventAutoHideAsync().catch(() => undefined);
initSentry();

function useBootstrapRedirect() {
  const router = useRouter();
  const segments = useSegments();
  const { loaded, onboardingCompleted, load } = useSettingsStore();

  useEffect(() => {
    if (!loaded) load();
  }, [load, loaded]);

  useEffect(() => {
    if (!loaded) return;
    const inOnboarding = segments[0] === 'onboarding';
    const inModal = segments[0] === 'modal';
    if (!onboardingCompleted && !inOnboarding && !inModal) {
      router.replace('/onboarding/welcome');
    }
  }, [loaded, onboardingCompleted, segments, router]);

  return loaded;
}

export default function RootLayout() {
  const { loaded: fontsLoaded, error: fontsError } = useFonts();
  const [dbReady, setDbReady] = useState(false);
  const settingsLoaded = useBootstrapRedirect();

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err: unknown) => {
        log.error('db init failed', err);
        setDbReady(true);
      });
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontsError) && dbReady && settingsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontsError, dbReady, settingsLoaded]);

  if (!fontsLoaded && !fontsError) return null;
  if (!dbReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FAF7F2' },
          }}
        >
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="group/[id]" />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="modal/scan-progress"
            options={{ presentation: 'modal' }}
          />
        </Stack>
        <RewardToast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
