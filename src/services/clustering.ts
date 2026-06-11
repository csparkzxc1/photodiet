import type { PhotoRow } from '@/db/queries';

export type ClusterPhoto = Pick<
  PhotoRow,
  | 'id'
  | 'taken_at'
  | 'location_lat'
  | 'location_lng'
  | 'embedding'
  | 'best_score'
>;

export type Cluster = {
  startedAt: number;
  endedAt: number;
  photoIds: number[];
  bestPhotoId: number;
};

export type ComputeDistance = (
  a: Uint8Array,
  b: Uint8Array,
) => Promise<number> | number;

export type ClusterOptions = {
  /** Max time gap (ms) between adjacent photos to remain in same time bucket. */
  timeWindowMs?: number;
  /** Max location gap (meters) when both photos have GPS. */
  locationRadiusMeters?: number;
  /** Feature print distance threshold; smaller = stricter similarity. */
  similarityThreshold?: number;
  /** Minimum group size. */
  minGroupSize?: number;
  /** Maximum group size; larger groups are split. */
  maxGroupSize?: number;
};

const DEFAULTS: Required<ClusterOptions> = {
  timeWindowMs: 5 * 60 * 1000,
  locationRadiusMeters: 50,
  similarityThreshold: 0.35,
  minGroupSize: 2,
  maxGroupSize: 50,
};

/**
 * Pure clustering: time-window buckets → location filter → visual similarity split.
 * Deterministic for a given input + `computeDistance`.
 */
export async function clusterPhotos(
  photos: ClusterPhoto[],
  computeDistance: ComputeDistance,
  options: ClusterOptions = {},
): Promise<Cluster[]> {
  const opts: Required<ClusterOptions> = { ...DEFAULTS, ...options };
  const sorted = [...photos].sort((a, b) => a.taken_at - b.taken_at);

  // 1) Time-window buckets.
  const timeBuckets: ClusterPhoto[][] = [];
  for (const p of sorted) {
    const last = timeBuckets[timeBuckets.length - 1];
    if (
      last &&
      last.length > 0 &&
      p.taken_at - (last[last.length - 1]?.taken_at ?? 0) <= opts.timeWindowMs
    ) {
      last.push(p);
    } else {
      timeBuckets.push([p]);
    }
  }

  // 2) Location filter (only when both have GPS).
  const locationBuckets: ClusterPhoto[][] = [];
  for (const bucket of timeBuckets) {
    if (bucket.length < 2) continue;
    const subBuckets: ClusterPhoto[][] = [];
    let current: ClusterPhoto[] = [];
    for (const p of bucket) {
      const last = current[current.length - 1];
      if (
        !last ||
        haversineDistanceMeters(
          last.location_lat,
          last.location_lng,
          p.location_lat,
          p.location_lng,
        ) <= opts.locationRadiusMeters
      ) {
        current.push(p);
      } else {
        if (current.length > 0) subBuckets.push(current);
        current = [p];
      }
    }
    if (current.length > 0) subBuckets.push(current);
    for (const sb of subBuckets) {
      if (sb.length >= opts.minGroupSize) locationBuckets.push(sb);
    }
  }

  // 3) Visual similarity split.
  const clusters: Cluster[] = [];
  for (const bucket of locationBuckets) {
    const visualGroups = await splitByVisualSimilarity(
      bucket,
      computeDistance,
      opts.similarityThreshold,
    );

    for (const group of visualGroups) {
      if (group.length < opts.minGroupSize) continue;
      for (const subgroup of chunkArray(group, opts.maxGroupSize)) {
        if (subgroup.length < opts.minGroupSize) continue;
        clusters.push(buildCluster(subgroup));
      }
    }
  }

  return clusters;
}

async function splitByVisualSimilarity(
  photos: ClusterPhoto[],
  computeDistance: ComputeDistance,
  threshold: number,
): Promise<ClusterPhoto[][]> {
  if (photos.length === 0) return [];
  const groups: ClusterPhoto[][] = [];
  let current: ClusterPhoto[] = [photos[0]!];

  for (let i = 1; i < photos.length; i++) {
    const prev = photos[i - 1]!;
    const cur = photos[i]!;
    let distance = 2;
    if (prev.embedding && cur.embedding) {
      distance = await computeDistance(prev.embedding, cur.embedding);
    }
    if (distance < threshold) {
      current.push(cur);
    } else {
      groups.push(current);
      current = [cur];
    }
  }
  groups.push(current);
  return groups;
}

function buildCluster(photos: ClusterPhoto[]): Cluster {
  const sorted = [...photos].sort((a, b) => a.taken_at - b.taken_at);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const best = photos.reduce((acc, p) =>
    (p.best_score ?? 0) > (acc.best_score ?? 0) ? p : acc,
  );
  return {
    startedAt: first.taken_at,
    endedAt: last.taken_at,
    photoIds: sorted.map((p) => p.id),
    bestPhotoId: best.id,
  };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  if (arr.length <= size) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function haversineDistanceMeters(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null,
): number {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return 0; // No GPS info → assume same location
  }
  const R = 6371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function labelForGroup(startedAt: number): string {
  const d = new Date(startedAt);
  const hour = d.getHours();
  const part =
    hour < 6
      ? '새벽'
      : hour < 12
        ? '오전'
        : hour < 18
          ? '오후'
          : '저녁';
  return `${part} ${(hour % 12 === 0 ? 12 : hour % 12)}시`;
}
