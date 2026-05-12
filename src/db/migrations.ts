import type { SQLiteDatabase } from 'expo-sqlite';

import { createLogger } from '@/utils/log';

const log = createLogger('db.migrations');

type Migration = {
  id: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
};

const migrations: Migration[] = [
  {
    id: 1,
    name: 'initial_schema',
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS photos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          asset_id TEXT NOT NULL UNIQUE,
          taken_at INTEGER NOT NULL,
          location_lat REAL,
          location_lng REAL,
          width INTEGER,
          height INTEGER,
          file_size INTEGER,
          embedding BLOB,
          blur_score REAL,
          face_count INTEGER DEFAULT 0,
          eyes_open_ratio REAL,
          best_score REAL,
          group_id INTEGER,
          is_deleted_locally INTEGER DEFAULT 0,
          analyzed_at INTEGER,
          FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_photos_taken_at ON photos(taken_at);
        CREATE INDEX IF NOT EXISTS idx_photos_group_id ON photos(group_id);
        CREATE INDEX IF NOT EXISTS idx_photos_analyzed ON photos(analyzed_at);

        CREATE TABLE IF NOT EXISTS groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          started_at INTEGER NOT NULL,
          ended_at INTEGER NOT NULL,
          location_cluster TEXT,
          best_photo_id INTEGER,
          photo_count INTEGER NOT NULL DEFAULT 0,
          resolved INTEGER DEFAULT 0,
          resolved_at INTEGER,
          FOREIGN KEY (best_photo_id) REFERENCES photos(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_groups_resolved ON groups(resolved);
        CREATE INDEX IF NOT EXISTS idx_groups_started_at ON groups(started_at);

        CREATE TABLE IF NOT EXISTS cleanup_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          group_id INTEGER,
          action TEXT NOT NULL,
          deleted_count INTEGER DEFAULT 0,
          bytes_freed INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_cleanup_logs_created ON cleanup_logs(created_at);

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);

      const now = Date.now();
      await db.runAsync(
        `INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)`,
        [
          'onboarding_completed',
          'false',
          now,
          'plan',
          'free',
          now,
          'free_quota_used',
          '0',
          now,
        ],
      );
    },
  },
];

async function ensureMigrationsTable(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at INTEGER NOT NULL
    );
  `);
}

async function getAppliedIds(db: SQLiteDatabase): Promise<Set<number>> {
  const rows = await db.getAllAsync<{ id: number }>(
    `SELECT id FROM _migrations ORDER BY id ASC`,
  );
  return new Set(rows.map((r) => r.id));
}

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await ensureMigrationsTable(db);
  const applied = await getAppliedIds(db);

  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;

    log.info(`applying migration ${migration.id}: ${migration.name}`);
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.runAsync(
        `INSERT INTO _migrations (id, name, applied_at) VALUES (?, ?, ?)`,
        [migration.id, migration.name, Date.now()],
      );
    });
    log.info(`applied migration ${migration.id}`);
  }
}
