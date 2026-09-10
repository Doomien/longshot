// Random utilities. Pure functions — no DOM, engine-agnostic.
// Seeded RNG (mulberry32) enables reproducible sessions / daily challenges;
// Gaussian (Box-Muller) is used for shot dispersion so most shots land near
// the reticle and extreme deviations are rare (never uniform randomness).

export type Rng = () => number;

/** Deterministic PRNG. Same seed -> same sequence. */
export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Standard-normal sample (mean 0, stddev 1) via Box-Muller.
 * Accepts an injectable rng so gameplay can be deterministic in tests.
 */
export function gaussian(rng: Rng = Math.random): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
