import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

import { createLogger } from '@/utils/log';

const log = createLogger('sentry');

let initialized = false;

export function initSentry(): void {
  if (initialized) return;

  const dsn =
    process.env.EXPO_PUBLIC_SENTRY_DSN ??
    (Constants.expoConfig?.extra?.sentryDsn as string | undefined);

  if (!dsn) {
    log.info('no DSN configured, skipping init');
    return;
  }

  Sentry.init({
    dsn,
    enableAutoSessionTracking: true,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    debug: __DEV__,
  });

  initialized = true;
  log.info('initialized');
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized) {
    log.warn('sentry not initialized, falling back to console', { error, context });
    return;
  }
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export const wrap = Sentry.wrap;
