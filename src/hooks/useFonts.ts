import { useFonts as useExpoFonts } from 'expo-font';

import { createLogger } from '@/utils/log';

const log = createLogger('fonts');

export function useFonts(): { loaded: boolean; error: Error | null } {
  const [loaded, error] = useExpoFonts({
    /* eslint-disable @typescript-eslint/no-require-imports */
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
    /* eslint-enable @typescript-eslint/no-require-imports */
  });

  if (error) {
    log.warn('font load failed', { message: error.message });
  }

  return { loaded, error };
}
