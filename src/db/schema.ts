import type { Generated } from 'kysely';

export interface PhotosTable {
  id: Generated<number>;
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
}

export interface GroupsTable {
  id: Generated<number>;
  started_at: number;
  ended_at: number;
  location_cluster: string | null;
  best_photo_id: number | null;
  photo_count: number;
  resolved: number;
  resolved_at: number | null;
}

export type CleanupAction =
  | 'kept_best'
  | 'kept_all'
  | 'deleted_all'
  | 'skipped';

export interface CleanupLogsTable {
  id: Generated<number>;
  group_id: number | null;
  action: CleanupAction;
  deleted_count: number;
  bytes_freed: number;
  created_at: number;
}

export interface SettingsTable {
  key: string;
  value: string;
  updated_at: number;
}

export interface Database {
  photos: PhotosTable;
  groups: GroupsTable;
  cleanup_logs: CleanupLogsTable;
  settings: SettingsTable;
}

export const SETTINGS_KEYS = {
  onboardingCompleted: 'onboarding_completed',
  plan: 'plan',
  freeQuotaUsed: 'free_quota_used',
} as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[keyof typeof SETTINGS_KEYS];
