import * as MediaLibrary from 'expo-media-library';

import { createLogger } from '@/utils/log';

const log = createLogger('assetUri');

const cache = new Map<string, string>();

export async function getAssetUri(assetId: string): Promise<string | null> {
  const cached = cache.get(assetId);
  if (cached) return cached;
  try {
    const info = await MediaLibrary.getAssetInfoAsync(assetId, {
      shouldDownloadFromNetwork: false,
    });
    const uri = info.localUri ?? info.uri;
    if (uri) {
      cache.set(assetId, uri);
      return uri;
    }
    return null;
  } catch (err) {
    log.warn('getAssetInfoAsync failed', { assetId, err });
    return null;
  }
}

export function clearUriCache(): void {
  cache.clear();
}
