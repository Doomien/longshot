import type { LevelDefinition } from '../levels/LevelDefinition.ts';
import type { TargetSpawnPoint } from './TargetDefinitions.ts';
import { shuffle, type Rng } from '../utils/random.ts';

// Session setup: shuffle authored spawn points (seeded) and take the first N.
// Deterministic per seed -> reproducible bugs, daily challenges, fair tests.

// Re-exported so existing import sites (and tests) keep working.
export { shuffle };

export function selectSpawnPoints(
  level: LevelDefinition,
  count: number,
  rng: Rng = Math.random,
): TargetSpawnPoint[] {
  return shuffle(level.spawnPoints, rng).slice(0, Math.max(0, count));
}
