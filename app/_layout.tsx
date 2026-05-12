import '../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initDatabase } from '@/db/client';
import { useFonts } from '@/hooks/useFonts';
import { initSentry } from '@/services/sentry';
import { createLogger } from '@/utils/log';

const log = createLogger('root');

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore — splash may already be hidden.
});

initSentry();

export default function RootLayout() {
  const { loaded: fontsLoaded, error: fontsError } = useFonts();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err: unknown) => {
        log.error('db init failed', err);
        setDbReady(true);
      });
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontsError) && dbReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontsError, dbReady]);

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
          <Stack.Screen
            name="paywall"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="modal/scan-progress"
            options={{ presentation: 'modal' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
