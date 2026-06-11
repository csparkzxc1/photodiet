import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { createLogger } from '@/utils/log';

import { runMigrations } from './migrations';

const log = createLogger('db.client');
const DB_NAME = 'photodiet.db';

let dbInstance: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

export function getDatabase(): SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = openDatabaseSync(DB_NAME);
  }
  return dbInstance;
}

export async function initDatabase(): Promise<SQLiteDatabase> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = getDatabase();
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);
    await runMigrations(db);
    log.info('database initialized');
    return db;
  })();

  return initPromise;
}

export async function resetDatabase(): Promise<void> {
  // For dev only. Drops all tables.
  const db = getDatabase();
  await db.execAsync(`
    DROP TABLE IF EXISTS cleanup_logs;
    DROP TABLE IF EXISTS photos;
    DROP TABLE IF EXISTS groups;
    DROP TABLE IF EXISTS settings;
    DROP TABLE IF EXISTS _migrations;
  `);
  initPromise = null;
  log.warn('database reset');
}
