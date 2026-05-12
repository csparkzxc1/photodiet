import * as MediaLibrary from 'expo-media-library';
import { Linking, Platform } from 'react-native';

import { upsertPhotos, type InsertPhoto } from '@/db/queries';
import { createLogger } from '@/utils/log';

const log = createLogger('photos');

export type PermissionState = {
  status: MediaLibrary.PermissionStatus;
  accessPrivileges: 'all' | 'limited' | 'none';
  canAskAgain: boolean;
};

export async function getPermissionState(): Promise<PermissionState> {
  const result = await MediaLibrary.getPermissionsAsync(true);
  return {
    status: result.status,
    accessPrivileges: (result.accessPrivileges ?? 'none') as PermissionState['accessPrivileges'],
    canAskAgain: result.canAskAgain,
  };
}

export async function requestPermission(): Promise<PermissionState> {
  const result = await MediaLibrary.requestPermissionsAsync(true);
  return {
    status: result.status,
    accessPrivileges: (result.accessPrivileges ?? 'none') as PermissionState['accessPrivileges'],
    canAskAgain: result.canAskAgain,
  };
}

export async function openAppSettings(): Promise<void> {
  if (Platform.OS === 'ios') {
    await Linking.openURL('app-settings:');
  } else {
    await Linking.openSettings();
  }
}

export type AssetMeta = {
  id: string;
  takenAt: number;
  width: number;
  height: number;
  latitude: number | null;
  longitude: number | null;
  fileSize: number | null;
};

const BATCH = 200;

export type IndexProgress = {
  total: number;
  scanned: number;
};

/**
 * Iterates the photo library and persists asset metadata to the photos table.
 * Returns the total scanned asset count.
 */
export async function indexAllPhotos(
  onProgress?: (p: IndexProgress) => void,
  signal?: { aborted: boolean },
): Promise<number> {
  let endCursor: string | undefined = undefined;
  let hasNextPage = true;
  let scanned = 0;
  let total = 0;

  // First page also gives us totalCount.
  while (hasNextPage) {
    if (signal?.aborted) {
      log.warn('indexing aborted');
      break;
    }

    const page = await MediaLibrary.getAssetsAsync({
      first: BATCH,
      after: endCursor,
      mediaType: [MediaLibrary.MediaType.photo],
      sortBy: [[MediaLibrary.SortBy.creationTime, true]],
    });

    if (total === 0) total = page.totalCount;

    const rows: InsertPhoto[] = await Promise.all(
      page.assets.map(async (a) => {
        // Location is opt-in; fetch only if not present in the basic record.
        let lat: number | null = null;
        let lng: number | null = null;
        let fileSize: number | null = null;
        try {
          const info = await MediaLibrary.getAssetInfoAsync(a.id, {
            shouldDownloadFromNetwork: false,
          });
          lat = info.location?.latitude ?? null;
          lng = info.location?.longitude ?? null;
          // fileSize is undocumented on AssetInfo; rely on ImagePicker-like fields when present.
          // We leave null if not available.
          const maybeSize = (info as unknown as { fileSize?: number }).fileSize;
          if (typeof maybeSize === 'number') fileSize = maybeSize;
        } catch (err) {
          log.warn('getAssetInfoAsync failed', { id: a.id, err });
        }
        return {
          asset_id: a.id,
          taken_at: a.creationTime,
          location_lat: lat,
          location_lng: lng,
          width: a.width,
          height: a.height,
          file_size: fileSize,
        };
      }),
    );

    await upsertPhotos(rows);
    scanned += page.assets.length;
    onProgress?.({ total, scanned });

    hasNextPage = page.hasNextPage;
    endCursor = page.endCursor;
  }

  log.info('indexing complete', { scanned, total });
  return scanned;
}

export async function deleteAssetsFromLibrary(
  assetIds: string[],
): Promise<boolean> {
  if (assetIds.length === 0) return true;
  try {
    return await MediaLibrary.deleteAssetsAsync(assetIds);
  } catch (err) {
    log.warn('deleteAssetsAsync failed', err);
    return false;
  }
}
