import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeBestScore } from '../src/services/scoring';

test('sharper photo scores higher than blurry one', () => {
  const sharp = computeBestScore({ blur_score: 800, face_count: 1, eyes_open_ratio: 1 });
  const blurry = computeBestScore({ blur_score: 30, face_count: 1, eyes_open_ratio: 1 });
  assert.ok(sharp > blurry, `expected sharp > blurry; got ${sharp} vs ${blurry}`);
});

test('open eyes outscore closed', () => {
  const open = computeBestScore({ blur_score: 500, face_count: 1, eyes_open_ratio: 1 });
  const closed = computeBestScore({ blur_score: 500, face_count: 1, eyes_open_ratio: 0 });
  assert.ok(open > closed);
});

test('output is in [0, 1]', () => {
  const s = computeBestScore({ blur_score: 999_999, face_count: 5, eyes_open_ratio: 1 });
  assert.ok(s >= 0 && s <= 1, `got ${s}`);
});
