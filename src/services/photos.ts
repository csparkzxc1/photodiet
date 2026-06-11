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

export type AlbumInfo = {
  id: string;
  title: string;
  assetCount: number;
  thumbnailAssetId: string | null;
};

/**
 * Lists albums with their first asset for preview.
 * Filters out empty albums.
 */
export async function getAlbums(): Promise<AlbumInfo[]> {
  const albums = await MediaLibrary.getAlbumsAsync({
    includeSmartAlbums: true,
  });
  const filtered = albums.filter((a) => a.assetCount > 0);
  const result = await Promise.all(
    filtered.map(async (a): Promise<AlbumInfo> => {
      let thumbnail: string | null = null;
      try {
        const page = await MediaLibrary.getAssetsAsync({
          album: a.id,
          first: 1,
          mediaType: [MediaLibrary.MediaType.photo],
        });
        thumbnail = page.assets[0]?.id ?? null;
      } catch (err) {
        log.warn('album thumbnail failed', { id: a.id, err });
      }
      return {
        id: a.id,
        title: a.title,
        assetCount: a.assetCount,
        thumbnailAssetId: thumbnail,
      };
    }),
  );
  return result.sort((a, b) => b.assetCount - a.assetCount);
}

const BATCH = 200;

export type IndexProgress = {
  total: number;
  scanned: number;
};

export type IndexOptions = {
  albumIds?: string[] | null;
};

async function scanPage(
  page: MediaLibrary.PagedInfo<MediaLibrary.Asset>,
): Promise<number> {
  const rows: InsertPhoto[] = await Promise.all(
    page.assets.map(async (a) => {
      let lat: number | null = null;
      let lng: number | null = null;
      let fileSize: number | null = null;
      try {
        const info = await MediaLibrary.getAssetInfoAsync(a.id, {
          shouldDownloadFromNetwork: false,
        });
        lat = info.location?.latitude ?? null;
        lng = info.location?.longitude ?? null;
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
  return rows.length;
}

async function scanScope(
  albumId: string | undefined,
  onPagePersisted: (added: number, pageTotal: number) => void,
  signal?: { aborted: boolean },
): Promise<void> {
  let endCursor: string | undefined = undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    if (signal?.aborted) break;

    const page = await MediaLibrary.getAssetsAsync({
      first: BATCH,
      after: endCursor,
      mediaType: [MediaLibrary.MediaType.photo],
      sortBy: [[MediaLibrary.SortBy.creationTime, true]],
      ...(albumId ? { album: albumId } : {}),
    });

    const added = await scanPage(page);
    onPagePersisted(added, page.totalCount);

    hasNextPage = page.hasNextPage;
    endCursor = page.endCursor;
  }
}

/**
 * Iterates the photo library (or selected albums) and persists asset metadata.
 * If albumIds is null/empty, scans the entire library.
 */
export async function indexAllPhotos(
  onProgress?: (p: IndexProgress) => void,
  signal?: { aborted: boolean },
  options?: IndexOptions,
): Promise<number> {
  const albumIds = options?.albumIds && options.albumIds.length > 0
    ? options.albumIds
    : null;

  let scanned = 0;
  let total = 0;

  if (albumIds === null) {
    await scanScope(
      undefined,
      (added, pageTotal) => {
        if (total === 0) total = pageTotal;
        scanned += added;
        onProgress?.({ total, scanned });
      },
      signal,
    );
  } else {
    // Get total count across all selected albums first
    for (const id of albumIds) {
      try {
        const meta = await MediaLibrary.getAssetsAsync({
          album: id,
          first: 1,
          mediaType: [MediaLibrary.MediaType.photo],
        });
        total += meta.totalCount;
      } catch (err) {
        log.warn('album count probe failed', { id, err });
      }
    }
    onProgress?.({ total, scanned: 0 });

    for (const id of albumIds) {
      if (signal?.aborted) break;
      await scanScope(
        id,
        (added) => {
          scanned += added;
          onProgress?.({ total, scanned });
        },
        signal,
      );
    }
  }

  log.info('indexing complete', { scanned, total, scope: albumIds ?? 'all' });
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
