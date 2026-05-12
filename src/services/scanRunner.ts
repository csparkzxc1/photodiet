import { useScanStore } from '@/stores/scanStore';
import { createLogger } from '@/utils/log';

const log = createLogger('scan');

type Deps = {
  indexAllPhotos: (
    onProgress: (p: { scanned: number; total: number }) => void,
    signal: { aborted: boolean },
  ) => Promise<number>;
  analyzeAndCluster?: (signal: { aborted: boolean }) => Promise<number>;
};

/**
 * Phase B: indexing only. Phase C plugs in analyzeAndCluster.
 */
export async function runFullScan(
  signal: { aborted: boolean },
  deps: Deps,
): Promise<void> {
  const store = useScanStore.getState();
  store.reset();
  store.startIndexing();

  try {
    await deps.indexAllPhotos(
      (p) => useScanStore.getState().setIndexProgress(p.scanned, p.total),
      signal,
    );

    if (signal.aborted) return;

    if (deps.analyzeAndCluster) {
      const groupCount = await deps.analyzeAndCluster(signal);
      if (signal.aborted) return;
      useScanStore.getState().finish(groupCount);
    } else {
      useScanStore.getState().finish(0);
    }
  } catch (err) {
    log.error('scan failed', err);
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    useScanStore.getState().fail(message);
  }
}
