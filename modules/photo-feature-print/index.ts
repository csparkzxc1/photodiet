import { requireNativeModule } from 'expo-modules-core';

export type FeaturePrintResult = {
  embedding: string;
  blur_score: number;
  face_count: number;
  eyes_open_ratio: number;
  width: number;
  height: number;
  duration_ms: number;
};

export type PhotoFeaturePrintModule = {
  analyzeAsset(assetId: string): Promise<FeaturePrintResult>;
  analyzeAssets(assetIds: string[]): Promise<FeaturePrintResult[]>;
  computeDistance(embeddingA: string, embeddingB: string): Promise<number>;
};

let cached: PhotoFeaturePrintModule | null = null;

export function getModule(): PhotoFeaturePrintModule | null {
  if (cached) return cached;
  try {
    cached = requireNativeModule<PhotoFeaturePrintModule>('PhotoFeaturePrint');
    return cached;
  } catch {
    return null;
  }
}
