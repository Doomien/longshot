import type { LevelDefinition } from '../levels/LevelDefinition.ts';
import type { TargetSpawnPoint } from './TargetDefinitions.ts';
import type { Rng } from '../utils/random.ts';

// Session setup: shuffle authored spawn points (seeded) and take the first N.
// Deterministic per seed -> reproducible bugs, daily challenges, fair tests.

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function selectSpawnPoints(
  level: LevelDefinition,
  count: number,
  rng: Rng = Math.random,
): TargetSpawnPoint[] {
  return shuffle(level.spawnPoints, rng).slice(0, Math.max(0, count));
}
