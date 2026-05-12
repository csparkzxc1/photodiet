import { countPhotos } from '@/db/queries';
import { useScanStore } from '@/stores/scanStore';
import { createLogger } from '@/utils/log';

const log = createLogger('scan');

type Deps = {
  indexAllPhotos: (
    onProgress: (p: { scanned: number; total: number }) => void,
    signal: { aborted: boolean },
  ) => Promise<number>;
  analyzeAllPending: (deps: {
    onProgress: (p: { done: number; total: number }) => void;
    signal: { aborted: boolean };
  }) => Promise<number>;
  clusterAllPhotos: () => Promise<number>;
};

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

    const totalToAnalyze = await countPhotos();
    useScanStore.getState().startAnalyzing(totalToAnalyze);

    await deps.analyzeAllPending({
      signal,
      onProgress: (p) => useScanStore.getState().setAnalyzeProgress(p.done),
    });
    if (signal.aborted) return;

    useScanStore.getState().startClustering();
    const groupCount = await deps.clusterAllPhotos();
    if (signal.aborted) return;

    useScanStore.getState().finish(groupCount);
  } catch (err) {
    log.error('scan failed', err);
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    useScanStore.getState().fail(message);
  }
}
