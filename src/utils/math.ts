// Pure math helpers. No DOM/Canvas dependencies — safe to reuse under any renderer.

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Frame-rate-independent exponential smoothing factor.
 * Use as: current += (target - current) * smoothingFactor(rate, dt)
 * Must be used everywhere time-based smoothing occurs (aim follow,
 * camera pan, stability recovery) instead of fixed lerp factors.
 */
export function smoothingFactor(rate: number, dt: number): number {
  return 1 - Math.exp(-rate * dt);
}

export function length(x: number, y: number): number {
  return Math.hypot(x, y);
}
