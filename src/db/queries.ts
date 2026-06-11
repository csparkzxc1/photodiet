import type { SQLiteDatabase, SQLiteRunResult } from 'expo-sqlite';

import { getDatabase } from './client';
import type {
  CleanupAction,
  CleanupLogsTable,
  GroupsTable,
  PhotosTable,
  SettingsKey,
  SettingsTable,
} from './schema';

export type PhotoRow = {
  id: number;
  asset_id: string;
  taken_at: number;
  location_lat: number | null;
  location_lng: number | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  embedding: Uint8Array | null;
  blur_score: number | null;
  face_count: number;
  eyes_open_ratio: number | null;
  best_score: number | null;
  group_id: number | null;
  is_deleted_locally: number;
  analyzed_at: number | null;
};

export type GroupRow = {
  id: number;
  started_at: number;
  ended_at: number;
  location_cluster: string | null;
  best_photo_id: number | null;
  photo_count: number;
  resolved: number;
  resolved_at: number | null;
};

export type CleanupLogRow = {
  id: number;
  group_id: number | null;
  action: CleanupAction;
  deleted_count: number;
  bytes_freed: number;
  created_at: number;
};

function db(): SQLiteDatabase {
  return getDatabase();
}

export type InsertPhoto = Omit<
  PhotosTable,
  'id' | 'embedding' | 'blur_score' | 'eyes_open_ratio' | 'best_score' | 'group_id' | 'is_deleted_locally' | 'analyzed_at' | 'face_count'
> & {
  face_count?: number;
};

export async function upsertPhotos(rows: InsertPhoto[]): Promise<void> {
  if (rows.length === 0) return;
  const conn = db();
  await conn.withTransactionAsync(async () => {
    for (const r of rows) {
      await conn.runAsync(
        `INSERT INTO photos (asset_id, taken_at, location_lat, location_lng, width, height, file_size)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(asset_id) DO UPDATE SET
           taken_at=excluded.taken_at,
           location_lat=excluded.location_lat,
           location_lng=excluded.location_lng,
           width=excluded.width,
           height=excluded.height,
           file_size=excluded.file_size`,
        [
          r.asset_id,
          r.taken_at,
          r.location_lat,
          r.location_lng,
          r.width,
          r.height,
          r.file_size,
        ],
      );
    }
  });
}

export async function countPhotos(): Promise<number> {
  const conn = db();
  const row = await conn.getFirstAsync<{ c: number }>(
    `SELECT COUNT(*) as c FROM photos WHERE is_deleted_locally = 0`,
  );
  return row?.c ?? 0;
}

export async function countAnalyzedPhotos(): Promise<number> {
  const conn = db();
  const row = await conn.getFirstAsync<{ c: number }>(
    `SELECT COUNT(*) as c FROM photos WHERE analyzed_at IS NOT NULL`,
  );
  return row?.c ?? 0;
}

/**
 * Returns never-analyzed photos. Failed ones (analyzed_at set, embedding null)
 * are NOT retried automatically — that caused infinite retry loops when Vision
 * consistently fails (e.g. iOS 18 espresso context error). Use
 * clearFailedAnalyses() to explicitly opt into retry.
 */
export async function getUnanalyzedAssetIds(limit: number): Promise<string[]> {
  const conn = db();
  const rows = await conn.getAllAsync<{ asset_id: string }>(
    `SELECT asset_id FROM photos
     WHERE analyzed_at IS NULL AND is_deleted_locally = 0
     ORDER BY taken_at ASC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => r.asset_id);
}

/**
 * Clears analyzed_at on photos that have no embedding (i.e. previously failed),
 * so the next analyze pass picks them up. Use after fixing native module issues.
 */
export async function clearFailedAnalyses(): Promise<number> {
  const conn = db();
  const result = await conn.runAsync(
    `UPDATE photos SET analyzed_at = NULL WHERE embedding IS NULL`,
  );
  return result.changes;
}

export async function getPhotosForAnalysis(limit: number): Promise<PhotoRow[]> {
  const conn = db();
  return conn.getAllAsync<PhotoRow>(
    `SELECT * FROM photos
     WHERE analyzed_at IS NULL AND is_deleted_locally = 0
     ORDER BY taken_at ASC LIMIT ?`,
    [limit],
  );
}

export async function getAllAnalyzedPhotos(): Promise<PhotoRow[]> {
  const conn = db();
  return conn.getAllAsync<PhotoRow>(
    `SELECT * FROM photos
     WHERE analyzed_at IS NOT NULL AND is_deleted_locally = 0
     ORDER BY taken_at ASC`,
  );
}

export async function updatePhotoAnalysis(
  assetId: string,
  data: {
    embedding: Uint8Array | null;
    blur_score: number;
    face_count: number;
    eyes_open_ratio: number;
    best_score: number;
  },
): Promise<void> {
  const conn = db();
  await conn.runAsync(
    `UPDATE photos
     SET embedding=?, blur_score=?, face_count=?, eyes_open_ratio=?, best_score=?, analyzed_at=?
     WHERE asset_id=?`,
    [
      data.embedding,
      data.blur_score,
      data.face_count,
      data.eyes_open_ratio,
      data.best_score,
      Date.now(),
      assetId,
    ],
  );
}

export async function assignGroupToPhotos(
  groupId: number,
  photoIds: number[],
): Promise<void> {
  if (photoIds.length === 0) return;
  const conn = db();
  const placeholders = photoIds.map(() => '?').join(',');
  await conn.runAsync(
    `UPDATE photos SET group_id = ? WHERE id IN (${placeholders})`,
    [groupId, ...photoIds],
  );
}

export async function clearAllGroups(): Promise<void> {
  const conn = db();
  await conn.execAsync(`UPDATE photos SET group_id = NULL; DELETE FROM groups;`);
}

export type InsertGroup = Omit<GroupsTable, 'id' | 'resolved' | 'resolved_at'>;

export async function insertGroup(g: InsertGroup): Promise<number> {
  const conn = db();
  const result: SQLiteRunResult = await conn.runAsync(
    `INSERT INTO groups (started_at, ended_at, location_cluster, best_photo_id, photo_count)
     VALUES (?, ?, ?, ?, ?)`,
    [
      g.started_at,
      g.ended_at,
      g.location_cluster,
      g.best_photo_id,
      g.photo_count,
    ],
  );
  return result.lastInsertRowId;
}

export async function updateGroupBestPhoto(
  groupId: number,
  bestPhotoId: number,
): Promise<void> {
  const conn = db();
  await conn.runAsync(`UPDATE groups SET best_photo_id = ? WHERE id = ?`, [
    bestPhotoId,
    groupId,
  ]);
}

export async function getUnresolvedGroups(): Promise<GroupRow[]> {
  const conn = db();
  return conn.getAllAsync<GroupRow>(
    `SELECT * FROM groups WHERE resolved = 0 ORDER BY started_at DESC`,
  );
}

export type ReclaimableSummary = {
  groupCount: number;
  totalPhotos: number;
  removablePhotos: number;
  reclaimableBytes: number;
  firstGroupId: number | null;
};

/**
 * Across all unresolved groups: total photos vs. "removable" (= non-best) photos
 * and the byte sum of those removable ones. Powers the home hero number.
 *
 * file_size may be null for many assets; this returns a lower-bound estimate.
 */
export async function getReclaimableSummary(): Promise<ReclaimableSummary> {
  const conn = db();
  const row = await conn.getFirstAsync<{
    group_count: number;
    total_photos: number;
    removable_photos: number;
    reclaimable_bytes: number;
    first_group_id: number | null;
  }>(
    `SELECT
       COUNT(DISTINCT g.id) AS group_count,
       COALESCE(SUM(CASE WHEN p.id IS NOT NULL THEN 1 ELSE 0 END), 0) AS total_photos,
       COALESCE(SUM(CASE WHEN p.id IS NOT NULL AND p.id != g.best_photo_id THEN 1 ELSE 0 END), 0) AS removable_photos,
       COALESCE(SUM(CASE WHEN p.id != g.best_photo_id THEN p.file_size ELSE 0 END), 0) AS reclaimable_bytes,
       MIN(g.id) AS first_group_id
     FROM groups g
     LEFT JOIN photos p ON p.group_id = g.id AND p.is_deleted_locally = 0
     WHERE g.resolved = 0`,
  );
  return {
    groupCount: row?.group_count ?? 0,
    totalPhotos: row?.total_photos ?? 0,
    removablePhotos: row?.removable_photos ?? 0,
    reclaimableBytes: row?.reclaimable_bytes ?? 0,
    firstGroupId: row?.first_group_id ?? null,
  };
}

export async function getGroup(id: number): Promise<GroupRow | null> {
  const conn = db();
  const row = await conn.getFirstAsync<GroupRow>(
    `SELECT * FROM groups WHERE id = ?`,
    [id],
  );
  return row ?? null;
}

export async function getPhotosInGroup(groupId: number): Promise<PhotoRow[]> {
  const conn = db();
  return conn.getAllAsync<PhotoRow>(
    `SELECT * FROM photos WHERE group_id = ? AND is_deleted_locally = 0
     ORDER BY best_score DESC, taken_at ASC`,
    [groupId],
  );
}

export async function getPhoto(id: number): Promise<PhotoRow | null> {
  const conn = db();
  const row = await conn.getFirstAsync<PhotoRow>(
    `SELECT * FROM photos WHERE id = ?`,
    [id],
  );
  return row ?? null;
}

export async function markGroupResolved(groupId: number): Promise<void> {
  const conn = db();
  await conn.runAsync(
    `UPDATE groups SET resolved = 1, resolved_at = ? WHERE id = ?`,
    [Date.now(), groupId],
  );
}

export async function markPhotosDeleted(photoIds: number[]): Promise<void> {
  if (photoIds.length === 0) return;
  const conn = db();
  const placeholders = photoIds.map(() => '?').join(',');
  await conn.runAsync(
    `UPDATE photos SET is_deleted_locally = 1 WHERE id IN (${placeholders})`,
    photoIds,
  );
}

export async function insertCleanupLog(
  log: Omit<CleanupLogsTable, 'id' | 'created_at'>,
): Promise<void> {
  const conn = db();
  await conn.runAsync(
    `INSERT INTO cleanup_logs (group_id, action, deleted_count, bytes_freed, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [log.group_id, log.action, log.deleted_count, log.bytes_freed, Date.now()],
  );
}

export async function getCleanupTotals(): Promise<{
  totalDeleted: number;
  totalBytesFreed: number;
  totalGroups: number;
}> {
  const conn = db();
  const row = await conn.getFirstAsync<{
    deleted: number;
    bytes: number;
    groups: number;
  }>(`SELECT
        COALESCE(SUM(deleted_count),0) as deleted,
        COALESCE(SUM(bytes_freed),0) as bytes,
        COUNT(DISTINCT group_id) as groups
      FROM cleanup_logs
      WHERE action IN ('kept_best','deleted_all')`);
  return {
    totalDeleted: row?.deleted ?? 0,
    totalBytesFreed: row?.bytes ?? 0,
    totalGroups: row?.groups ?? 0,
  };
}

export async function getCleanupLogsSince(
  sinceTs: number,
): Promise<CleanupLogRow[]> {
  const conn = db();
  return conn.getAllAsync<CleanupLogRow>(
    `SELECT * FROM cleanup_logs WHERE created_at >= ? ORDER BY created_at ASC`,
    [sinceTs],
  );
}

export async function getSetting(key: SettingsKey | string): Promise<string | null> {
  const conn = db();
  const row = await conn.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key = ?`,
    [key],
  );
  return row?.value ?? null;
}

export async function setSetting(
  key: SettingsKey | string,
  value: string,
): Promise<void> {
  const conn = db();
  await conn.runAsync(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`,
    [key, value, Date.now()],
  );
}

export async function incrementSettingNumber(
  key: SettingsKey | string,
  delta: number,
): Promise<number> {
  const current = await getSetting(key);
  const next = (current ? parseInt(current, 10) : 0) + delta;
  await setSetting(key, String(next));
  return next;
}

// Re-export types for service consumers
export type { SettingsTable };
