import Constants from 'expo-constants';

import { createLogger } from '@/utils/log';

const log = createLogger('sentry');

import type * as SentryRN from '@sentry/react-native';

type SentryModule = typeof SentryRN;

let initialized = false;
let sentryModule: SentryModule | null = null;

function tryLoadSentry(): SentryModule | null {
  if (sentryModule) return sentryModule;
  try {
    // Lazy require so that omitting the @sentry/react-native/expo config plugin
    // (i.e. no native linking) doesn't blow up at JS module load time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sentryModule = require('@sentry/react-native') as SentryModule;
    return sentryModule;
  } catch (err) {
    log.info('Sentry not available (native module missing)', { err });
    return null;
  }
}

export function initSentry(): void {
  if (initialized) return;

  const dsn =
    process.env.EXPO_PUBLIC_SENTRY_DSN ??
    (Constants.expoConfig?.extra?.sentryDsn as string | undefined);

  if (!dsn) {
    log.info('no DSN configured, skipping init');
    return;
  }

  const Sentry = tryLoadSentry();
  if (!Sentry) return;

  try {
    Sentry.init({
      dsn,
      enableAutoSessionTracking: true,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      debug: __DEV__,
    });
    initialized = true;
    log.info('initialized');
  } catch (err) {
    log.warn('Sentry.init failed', { err });
  }
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!initialized) {
    log.warn('sentry not initialized', { error, context });
    return;
  }
  const Sentry = sentryModule;
  if (!Sentry) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
