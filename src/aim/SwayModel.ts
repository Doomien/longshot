import type { Vec2 } from '../core/types.ts';

// MVP sine-wave sway: cheap, deterministic, tunable. Slow continuous drift
// (not random jitter) so the player can observe the sway path and time shots.
// Sway is computed in SCREEN pixels; the caller divides by zoom to get world
// units, which makes high zoom magnify apparent sway (the core tradeoff).

export function swayOffset(timeSeconds: number, amountPixels: number): Vec2 {
  return {
    x:
      Math.sin(timeSeconds * 1.7) * amountPixels * 0.6 +
      Math.sin(timeSeconds * 0.63 + 2.1) * amountPixels * 0.4,
    y:
      Math.sin(timeSeconds * 1.35 + 1.2) * amountPixels * 0.65 +
      Math.sin(timeSeconds * 0.51) * amountPixels * 0.35,
  };
}

/**
 * Sway amplitude from stability: full stability -> baseSway, fully unstable
 * -> baseSway * (1 + instabilityMultiplier). Post-MVP this can blend toward a
 * smooth-noise model without changing callers.
 */
export function swayAmountPixels(
  baseSwayPixels: number,
  stability01: number,
  instabilityMultiplier: number,
): number {
  const instability = 1 - stability01;
  return baseSwayPixels * (1 + instability * instabilityMultiplier);
}
