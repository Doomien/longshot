import type { LevelDefinition } from '../levels/LevelDefinition.ts';
import type { TargetSpawnPoint } from './TargetDefinitions.ts';
import { shuffle, type Rng } from '../utils/random.ts';

// Session setup: shuffle authored spawn points (seeded) and take the first N.
// Deterministic per seed -> reproducible bugs, daily challenges, fair tests.

// Re-exported so existing import sites (and tests) keep working.
export { shuffle };

export interface DealtSpawn {
  point: TargetSpawnPoint;
  /** Index into level.spawnPoints (for write-back editing). */
  index: number;
}

export function selectSpawnPoints(
  level: LevelDefinition,
  count: number,
  rng: Rng = Math.random,
): DealtSpawn[] {
  const indexed = level.spawnPoints.map((point, index) => ({ point, index }));
  return shuffle(indexed, rng).slice(0, Math.max(0, count));
}
