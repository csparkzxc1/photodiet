export type PhotoSignals = {
  blur_score: number;
  face_count: number;
  eyes_open_ratio: number;
};

/**
 * Returns a value in [0, 1]. Higher is "better".
 * Weights per spec §6.2.
 */
export function computeBestScore(p: PhotoSignals): number {
  const blurNormalized = Math.min(Math.max(p.blur_score, 0) / 500, 1);
  const eyes = clamp01(p.eyes_open_ratio);
  const facePresent = p.face_count > 0 ? 1 : 0.5;

  return blurNormalized * 0.45 + eyes * 0.35 + facePresent * 0.2;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
