import { getCleanupLogsSince, getCleanupTotals } from '@/db/queries';

export type DailyStat = {
  dayStartMs: number;
  deletedCount: number;
  bytesFreed: number;
};

export type StatsSummary = {
  totalDeleted: number;
  totalBytesFreed: number;
  totalGroups: number;
  daily: DailyStat[];
};

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function getStatsSummary(days = 30): Promise<StatsSummary> {
  const totals = await getCleanupTotals();
  const now = Date.now();
  const startDay = startOfDay(now - (days - 1) * 24 * 60 * 60 * 1000);

  const logs = await getCleanupLogsSince(startDay);

  const buckets = new Map<number, DailyStat>();
  for (let i = 0; i < days; i++) {
    const dayMs = startDay + i * 24 * 60 * 60 * 1000;
    buckets.set(dayMs, { dayStartMs: dayMs, deletedCount: 0, bytesFreed: 0 });
  }

  for (const log of logs) {
    if (log.action !== 'kept_best' && log.action !== 'deleted_all') continue;
    const dayMs = startOfDay(log.created_at);
    const bucket = buckets.get(dayMs);
    if (!bucket) continue;
    bucket.deletedCount += log.deleted_count;
    bucket.bytesFreed += log.bytes_freed;
  }

  return {
    ...totals,
    daily: Array.from(buckets.values()).sort((a, b) => a.dayStartMs - b.dayStartMs),
  };
}
