import {
  getCleanupTotals,
  insertCleanupLog,
  markGroupResolved,
  markPhotosDeleted,
  type PhotoRow,
} from '@/db/queries';
import { deleteAssetsFromLibrary } from '@/services/photos';
import { useRewardStore } from '@/stores/rewardStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { createLogger } from '@/utils/log';

const log = createLogger('cleanup');

export type ResolveAction = 'kept_best' | 'kept_all' | 'deleted_all' | 'skipped';

export type ResolveInput = {
  groupId: number;
  action: ResolveAction;
  toDelete: PhotoRow[];
};

export type ResolveResult = {
  deletedCount: number;
  bytesFreed: number;
};

/**
 * Resolves a group: deletes selected photos via MediaLibrary (system trash on iOS),
 * marks photos + group in DB, records the cleanup_log row.
 *
 * Throws if the user cancels the system delete dialog.
 */
export async function resolveGroup(input: ResolveInput): Promise<ResolveResult> {
  const { groupId, action, toDelete } = input;

  let deletedCount = 0;
  let bytesFreed = 0;

  if (toDelete.length > 0) {
    const assetIds = toDelete.map((p) => p.asset_id);
    const success = await deleteAssetsFromLibrary(assetIds);
    if (!success) {
      throw new Error('삭제가 취소되었어요.');
    }
    await markPhotosDeleted(toDelete.map((p) => p.id));
    deletedCount = toDelete.length;
    bytesFreed = toDelete.reduce((sum, p) => sum + (p.file_size ?? 0), 0);
  }

  await markGroupResolved(groupId);

  await insertCleanupLog({
    group_id: groupId,
    action,
    deleted_count: deletedCount,
    bytes_freed: bytesFreed,
  });

  // Bump free-quota usage and fire reward toast for delete actions.
  if (action === 'kept_best' || action === 'deleted_all') {
    await useSettingsStore.getState().incrementFreeQuota();
    if (bytesFreed > 0) {
      const totals = await getCleanupTotals();
      useRewardStore.getState().show(bytesFreed, totals.totalBytesFreed);
    }
  }

  log.info('group resolved', { groupId, action, deletedCount, bytesFreed });
  return { deletedCount, bytesFreed };
}
