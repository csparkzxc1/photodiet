/**
 * Run with: npx tsx --test tests/clustering.test.ts
 * (tsx is not bundled by default; this file is a reference test that
 * exercises pure clustering logic without React Native imports.)
 *
 * We avoid pulling in @/db/queries (which imports expo-sqlite) by using
 * structural types for ClusterPhoto.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { clusterPhotos } from '../src/services/clustering';

type Photo = {
  id: number;
  taken_at: number;
  location_lat: number | null;
  location_lng: number | null;
  embedding: Uint8Array | null;
  best_score: number | null;
};

function fakeEmbedding(seed: number): Uint8Array {
  const u8 = new Uint8Array(8);
  for (let i = 0; i < 8; i++) u8[i] = (seed + i) & 0xff;
  return u8;
}

function distSame(_a: Uint8Array, _b: Uint8Array): number {
  return 0.1;
}

function distFar(_a: Uint8Array, _b: Uint8Array): number {
  return 1.5;
}

test('groups photos within time window and similarity', async () => {
  const photos: Photo[] = [
    { id: 1, taken_at: 1000, location_lat: null, location_lng: null, embedding: fakeEmbedding(1), best_score: 0.4 },
    { id: 2, taken_at: 2000, location_lat: null, location_lng: null, embedding: fakeEmbedding(1), best_score: 0.6 },
    { id: 3, taken_at: 3000, location_lat: null, location_lng: null, embedding: fakeEmbedding(1), best_score: 0.5 },
    // big time gap → new group bucket
    { id: 4, taken_at: 10 * 60 * 1000, location_lat: null, location_lng: null, embedding: fakeEmbedding(2), best_score: 0.7 },
  ];

  const clusters = await clusterPhotos(photos, distSame);

  assert.equal(clusters.length, 1);
  assert.deepEqual(clusters[0]?.photoIds, [1, 2, 3]);
  assert.equal(clusters[0]?.bestPhotoId, 2);
});

test('splits group when visual distance is high', async () => {
  const photos: Photo[] = [
    { id: 1, taken_at: 1000, location_lat: null, location_lng: null, embedding: fakeEmbedding(1), best_score: 0.4 },
    { id: 2, taken_at: 2000, location_lat: null, location_lng: null, embedding: fakeEmbedding(2), best_score: 0.6 },
    { id: 3, taken_at: 3000, location_lat: null, location_lng: null, embedding: fakeEmbedding(3), best_score: 0.5 },
  ];

  const clusters = await clusterPhotos(photos, distFar);
  // distance > threshold (0.35) for every adjacent pair → every singleton,
  // and singletons below minGroupSize are dropped.
  assert.equal(clusters.length, 0);
});

test('deterministic across runs', async () => {
  const photos: Photo[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    taken_at: i * 1000,
    location_lat: null,
    location_lng: null,
    embedding: fakeEmbedding(1),
    best_score: (i % 5) / 5,
  }));

  const a = await clusterPhotos(photos, distSame);
  const b = await clusterPhotos(photos, distSame);
  assert.deepEqual(
    a.map((c) => c.photoIds),
    b.map((c) => c.photoIds),
  );
  assert.deepEqual(
    a.map((c) => c.bestPhotoId),
    b.map((c) => c.bestPhotoId),
  );
});
