import { Platform } from 'react-native';

import {
  assignGroupToPhotos,
  clearAllGroups,
  getAllAnalyzedPhotos,
  getPhoto,
  getUnanalyzedAssetIds,
  insertGroup,
  updateGroupBestPhoto,
  updatePhotoAnalysis,
} from '@/db/queries';
import { getModule, type FeaturePrintResult } from 'photo-feature-print';

import { clusterPhotos, labelForGroup } from './clustering';
import { computeBestScore } from './scoring';
import { createLogger } from '@/utils/log';

const log = createLogger('analyzer');

const ANALYZE_BATCH = 16;

export type AnalyzeProgress = { done: number; total: number };

export type AnalyzeDeps = {
  onProgress?: (p: AnalyzeProgress) => void;
  signal?: { aborted: boolean };
};

function decodeEmbedding(b64: string): Uint8Array {
  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }
  // Fallback: assume Buffer is unavailable; return empty.
  return new Uint8Array();
}

function encodeEmbedding(bytes: Uint8Array): string {
  if (typeof globalThis.btoa === 'function') {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i] ?? 0);
    }
    return globalThis.btoa(binary);
  }
  return '';
}

let moduleAvailabilityLogged = false;

async function analyzeOne(assetId: string): Promise<FeaturePrintResult | null> {
  const mod = getModule();
  if (!mod) {
    if (!moduleAvailabilityLogged) {
      log.warn('native module unavailable', { platform: Platform.OS });
      moduleAvailabilityLogged = true;
    }
    return null;
  }
  try {
    return await mod.analyzeAsset(assetId);
  } catch (err) {
    log.warn('analyzeAsset failed', { assetId, err: String(err) });
    return null;
  }
}

/**
 * Pulls unanalyzed photos from DB in batches and writes back analysis results.
 */
export async function analyzeAllPending(deps: AnalyzeDeps = {}): Promise<number> {
  let done = 0;
  let totalProcessed = 0;
  let succeeded = 0;
  let failed = 0;
  let sampleBlur: number | null = null;
  let sampleEmbeddingBytes: number | null = null;

  for (;;) {
    if (deps.signal?.aborted) break;

    const ids = await getUnanalyzedAssetIds(ANALYZE_BATCH);
    if (ids.length === 0) break;

    if (done === 0) {
      const initialBatch = ids.length;
      deps.onProgress?.({ done: 0, total: initialBatch });
    }

    for (const id of ids) {
      if (deps.signal?.aborted) break;
      const result = await analyzeOne(id);
      if (result) {
        const embedding = decodeEmbedding(result.embedding);
        const best = computeBestScore({
          blur_score: result.blur_score,
          face_count: result.face_count,
          eyes_open_ratio: result.eyes_open_ratio,
        });
        await updatePhotoAnalysis(id, {
          embedding: embedding.length > 0 ? embedding : null,
          blur_score: result.blur_score,
          face_count: result.face_count,
          eyes_open_ratio: result.eyes_open_ratio,
          best_score: best,
        });
        succeeded += 1;
        if (sampleBlur === null) sampleBlur = result.blur_score;
        if (sampleEmbeddingBytes === null) sampleEmbeddingBytes = embedding.length;
      } else {
        await updatePhotoAnalysis(id, {
          embedding: null,
          blur_score: 0,
          face_count: 0,
          eyes_open_ratio: 0,
          best_score: 0,
        });
        failed += 1;
      }
      done += 1;
      totalProcessed += 1;
      deps.onProgress?.({ done, total: done });
    }
  }

  log.info('analyze complete', {
    processed: totalProcessed,
    succeeded,
    failed,
    sampleBlur,
    sampleEmbeddingBytes,
  });
  return totalProcessed;
}

export async function clusterAllPhotos(): Promise<number> {
  const photos = await getAllAnalyzedPhotos();
  if (photos.length === 0) {
    log.info('clustering skipped: no analyzed photos');
    return 0;
  }

  const photosWithEmbedding = photos.filter(
    (p) => p.embedding && p.embedding.length > 0,
  );

  log.info('clustering input', {
    total: photos.length,
    withEmbedding: photosWithEmbedding.length,
    firstTakenAt: photos[0]?.taken_at,
    lastTakenAt: photos[photos.length - 1]?.taken_at,
    timeSpanMinutes:
      photos.length > 1
        ? Math.round(
            ((photos[photos.length - 1]?.taken_at ?? 0) -
              (photos[0]?.taken_at ?? 0)) /
              60_000,
          )
        : 0,
  });

  const mod = getModule();
  const compute = async (a: Uint8Array, b: Uint8Array): Promise<number> => {
    if (!mod) return 2;
    return mod.computeDistance(encodeEmbedding(a), encodeEmbedding(b));
  };

  await clearAllGroups();

  const clusters = await clusterPhotos(photos, compute);

  let inserted = 0;
  for (const c of clusters) {
    const id = await insertGroup({
      started_at: c.startedAt,
      ended_at: c.endedAt,
      location_cluster: labelForGroup(c.startedAt),
      best_photo_id: c.bestPhotoId,
      photo_count: c.photoIds.length,
    });
    await assignGroupToPhotos(id, c.photoIds);
    await updateGroupBestPhoto(id, c.bestPhotoId);
    inserted += 1;
  }

  log.info('clustering complete', { groups: inserted });
  return inserted;
}

export async function analyzeAndCluster(
  signal: { aborted: boolean },
): Promise<number> {
  await analyzeAllPending({ signal });
  if (signal.aborted) return 0;
  return clusterAllPhotos();
}

// Re-export for callers that want to peek at a single photo.
export { getPhoto };
