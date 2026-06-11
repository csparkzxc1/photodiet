import { create } from 'zustand';

export type ScanPhase = 'idle' | 'indexing' | 'analyzing' | 'clustering' | 'done' | 'error';

type ScanState = {
  phase: ScanPhase;
  indexProgress: { scanned: number; total: number };
  analyzeProgress: { done: number; total: number };
  groupCount: number;
  errorMessage: string | null;
  startedAt: number | null;
  finishedAt: number | null;
};

type ScanActions = {
  reset: () => void;
  startIndexing: () => void;
  setIndexProgress: (scanned: number, total: number) => void;
  startAnalyzing: (total: number) => void;
  setAnalyzeProgress: (done: number) => void;
  startClustering: () => void;
  finish: (groupCount: number) => void;
  fail: (message: string) => void;
};

const initial: ScanState = {
  phase: 'idle',
  indexProgress: { scanned: 0, total: 0 },
  analyzeProgress: { done: 0, total: 0 },
  groupCount: 0,
  errorMessage: null,
  startedAt: null,
  finishedAt: null,
};

export const useScanStore = create<ScanState & ScanActions>((set) => ({
  ...initial,
  reset: () => set(initial),
  startIndexing: () =>
    set({
      ...initial,
      phase: 'indexing',
      startedAt: Date.now(),
    }),
  setIndexProgress: (scanned, total) =>
    set({ indexProgress: { scanned, total } }),
  startAnalyzing: (total) =>
    set({ phase: 'analyzing', analyzeProgress: { done: 0, total } }),
  setAnalyzeProgress: (done) =>
    set((s) => ({ analyzeProgress: { done, total: s.analyzeProgress.total } })),
  startClustering: () => set({ phase: 'clustering' }),
  finish: (groupCount) =>
    set({ phase: 'done', groupCount, finishedAt: Date.now() }),
  fail: (message) => set({ phase: 'error', errorMessage: message, finishedAt: Date.now() }),
}));
