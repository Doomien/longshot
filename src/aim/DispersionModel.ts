import type { Vec2 } from '../core/types.ts';
import { gaussian, type Rng } from '../utils/random.ts';

// Hidden dispersion: deliberately small (fairness rule — visible sway
// dominates, hidden randomness stays subtle). World units.

/** Spread radius grows as stability drops. */
export function spreadWorld(
  baseDispersion: number,
  stability01: number,
  stabilityFactor = 1,
): number {
  return Math.max(0, baseDispersion * (1 + (1 - stability01) * stabilityFactor));
}

/** Offset a reticle point by Gaussian spread on each axis. */
export function applyDispersion(point: Vec2, spread: number, rng: Rng = Math.random): Vec2 {
  if (spread <= 0) return { ...point };
  return {
    x: point.x + gaussian(rng) * spread,
    y: point.y + gaussian(rng) * spread,
  };
}
